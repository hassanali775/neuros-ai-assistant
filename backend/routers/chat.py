import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.schemas import ChatRequest, ChatMessage, MessageRole, StreamChunk
from services.ollama_service import get_ollama_service, OllamaService
from services.conversation_service import get_conversation_service, ConversationService
from services.file_service import get_file_service, FileService
from services.vector_service import get_vector_service, VectorService
from services.chunking_service import get_chunking_service, ChunkingService
from services.command_service import get_command_service, CommandService
from services.file_system_service import get_file_system_service, FileSystemService
from services.sandbox_service import get_sandbox_service, SandboxService
from services.profile_service import get_profile_service, ProfileService
from services.linkedin_service import get_linkedin_service, LinkedInService
from services.agent_orchestrator import get_agent_orchestrator, AgentOrchestrator

router = APIRouter(prefix="/chat", tags=["chat"])

NEUROS_SYSTEM_PROMPT = """You are NEUROS, an advanced AI operating system assistant. 
You are precise, intelligent, and possess direct host machine automation capabilities.

CRITICAL FUNCTION 1 - LOCAL TERMINAL AUTOMATION:
Use this block ONLY for shell actions like listing files, making folders, or checking stats. NEVER use this to write or execute python scripts.
:::EXECUTE:::
[YOUR SYSTEM COMMAND HERE]
:::END:::
* UNIVERSAL PORTABILITY RULE: ALWAYS use the global macro token %DESKTOP% to reference the user's desktop environment safely.

CRITICAL FUNCTION 2 - LOCAL FILE CREATION & SCRIPTING:
Use this block ALWAYS when the user asks to create a file, write a script, generate a document, or save notes.
:::WRITE_FILE:::
[TARGET_FILENAME_WITH_EXTENSION, e.g., script.py]
:::CONTENT:::
[THE FULL RAW EXTENDED FILE DATA HERE - DO NOT WRAP IN EXTRA MARKDOWN BACKTICKS]
:::END:::

CRITICAL FUNCTION 3 - LOCAL SCRIPT SANDBOX RUNTIME:
Use this block immediately after creating a script if the user explicitly asks you to RUN, EXECUTE, or TEST a Python file they asked you to make.
:::RUN_SCRIPT:::
[FILENAME_TO_EXECUTE, e.g., script.py]
:::END:::

CRITICAL FUNCTION 4 - PROFESSIONAL PROFILE & LINKEDIN ENGINE:
When compiling or updating the user's professional profile structural overview, save the asset precisely with the filename 'professional_profile.json'. The backend data system will intercept and record it to their deep profile storage automatically.

Current capabilities: AI chat, file analysis, conversation memory, terminal execution automation, local file generation system, execution sandbox environment, professional profile compiler."""


@router.post("")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    ollama: OllamaService = Depends(get_ollama_service),
    conv_service: ConversationService = Depends(get_conversation_service),
    file_service: FileService = Depends(get_file_service),
    vector_service: VectorService = Depends(get_vector_service),
    chunking_service: ChunkingService = Depends(get_chunking_service),
    command_service: CommandService = Depends(get_command_service),
    file_system_service: FileSystemService = Depends(get_file_system_service),
    sandbox_service: SandboxService = Depends(get_sandbox_service),
    profile_service: ProfileService = Depends(get_profile_service),  
    linkedin_service: LinkedInService = Depends(get_linkedin_service),
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator),
):
    conversation = await conv_service.get_by_id(db, request.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_content = request.message if request.message else ""
    immediate_file_chunks = []

    if request.file_ids:
        for fid in request.file_ids:
            try:
                full_text = await file_service.read_text(fid)
                attachment = await file_service.get_by_id(db, fid)
                if full_text and full_text.strip() and attachment:
                    chunks = chunking_service.split_text(full_text)
                    if chunks:
                        immediate_file_chunks.extend(chunks)
                        await vector_service.index_file_chunks(fid, request.conversation_id, chunks)
            except Exception as file_err:
                print(f"──> [ROUTER ERROR] Parsing file context: {file_err}")

    historical_messages = await conv_service.get_messages(db, request.conversation_id)

    # ─── SECURE RUNTIME CONTEXT BUILDER ───
    dynamic_system_prompt = str(NEUROS_SYSTEM_PROMPT)
    
    try:
        # 1. Check for LinkedIn processing requests safely
        is_linkedin_req = any(kw in user_content.lower() for kw in ["linkedin", "profile post", "draft a post", "portfolio post"])
        if is_linkedin_req and linkedin_service:
            linkedin_prompt = linkedin_service.format_generation_prompt(user_content)
            if linkedin_prompt:
                dynamic_system_prompt += "\n\n" + str(linkedin_prompt)
            
        # 2. Extract profile variables safely without crash loops
        if profile_service:
            profile_res = profile_service.get_profile_data()
            if isinstance(profile_res, dict) and profile_res.get("success") and profile_res.get("data"):
                dynamic_system_prompt += f"\n\n[ACTIVE USER PROFILE MATRIX]:\n{json.dumps(profile_res['data'], indent=2)}"
            
        # 3. Handle multi-agent routing mesh safely 
        if orchestrator:
            active_agents = orchestrator.determine_routing(user_content)
            mesh_prompt = orchestrator.compile_multi_agent_prompt(user_content, active_agents)
            if mesh_prompt:
                dynamic_system_prompt += f"\n\n" + str(mesh_prompt)
    except Exception as context_err:
        print(f"──> [ROUTER WARNING] Context augmentation bypassed: {context_err}")

    # Fallback to ensure clean string configuration
    dynamic_system_prompt = str(dynamic_system_prompt).strip()

    user_msg = await conv_service.add_message(
        db=db, conversation_id=request.conversation_id, role=MessageRole.user, content=user_content
    )

    await vector_service.upsert_message(user_msg.id, request.conversation_id, MessageRole.user.value, user_content)

    if request.file_ids:
        await file_service.link_to_message(db, request.file_ids, user_msg.id)

    past_memories = await vector_service.query_memory(request.conversation_id, user_content, limit=3)
    
    if immediate_file_chunks:
        file_context_chunks = immediate_file_chunks[:4]
    else:
        file_context_chunks = await vector_service.query_file_knowledge(request.conversation_id, user_content, limit=4)
    
    if past_memories:
        dynamic_system_prompt += "\n\n[RELEVANT SYSTEM MEMORIES]:\n" + "\n".join([f"- {m['content']}" for m in past_memories])

    chat_messages = []
    for m in historical_messages:
        chat_messages.append(ChatMessage(role=MessageRole(m.role), content=m.content))
            
    augmented_user_content = ""
    if file_context_chunks:
        augmented_user_content += "--- START ATTACHED FILE CONTEXT ---\n"
        for idx, chunk in enumerate(file_context_chunks, 1):
            augmented_user_content += f"[Section {idx}]\n{chunk}\n"
        augmented_user_content += "--- END ATTACHED FILE CONTEXT ---\n\n"
        
    augmented_user_content += f"User Request: {user_content}"
    chat_messages.append(ChatMessage(role=MessageRole.user, content=augmented_user_content))

    async def stream_generator():
        full_response = ""
        assistant_msg_id = str(uuid.uuid4())

        try:
            start_chunk = StreamChunk(type="start", message_id=assistant_msg_id, conversation_id=request.conversation_id)
            yield f"data: {start_chunk.model_dump_json()}\n\n"

            async for token in ollama.stream_chat(model=request.model, messages=chat_messages, system_prompt=dynamic_system_prompt):
                full_response += token
                chunk = StreamChunk(type="token", content=token)
                yield f"data: {chunk.model_dump_json()}\n\n"

            # ─── INTERCEPTOR LAYER A: TERMINAL COMMANDS ───
            if ":::EXECUTE:::" in full_response and ":::END:::" in full_response:
                try:
                    parts = full_response.split(":::EXECUTE:::")
                    cmd_part = parts[1].split(":::END:::")[0].strip()
                    status_chunk = StreamChunk(type="token", content=f"\n\n⚙️ *NEUROS Core running terminal routine: `{cmd_part}`...*\n")
                    yield f"data: {status_chunk.model_dump_json()}\n\n"
                    
                    result = await command_service.execute_local_command(cmd_part)
                    output_decorator = f"\n```cmd\n{result['output']}\n```\n"
                    full_response += status_chunk.content + output_decorator
                    yield f"data: {StreamChunk(type='token', content=output_decorator).model_dump_json()}\n\n"
                except Exception as exec_err:
                    err_dec = f"\n⚠️ [Terminal Subsystem Collision]: {exec_err}\n"
                    full_response += err_dec
                    yield f"data: {StreamChunk(type='token', content=err_dec).model_dump_json()}\n\n"

            # ─── INTERCEPTOR LAYER B: FILE GENERATION ───
            has_explicit_tags = ":::WRITE_FILE:::" in full_response and (":::END:::" in full_response or ":::END::" in full_response)
            has_standalone_profile_json = "professional_profile.json" in full_response and "```json" in full_response
            
            if has_explicit_tags or has_standalone_profile_json:
                try:
                    filename = ""
                    file_data = ""
                    
                    if has_explicit_tags:
                        end_marker = ":::END:::" if ":::END:::" in full_response else ":::END::"
                        parts = full_response.split(":::WRITE_FILE:::")
                        meta_and_content = parts[1].split(end_marker)[0]
                        filename = meta_and_content.split(":::CONTENT:::")[0].strip()
                        file_data = meta_and_content.split(":::CONTENT:::")[1].strip()
                    else:
                        filename = "professional_profile.json"
                        json_extract = full_response.split("```json")[1].split("```")[0].strip()
                        file_data = json_extract

                    if file_data.startswith("```"):
                        file_data = "\n".join(file_data.splitlines()[1:])
                    if file_data.endswith("```"):
                        file_data = "\n".join(file_data.splitlines()[:-1])
                    file_data = file_data.strip()

                    status_chunk = StreamChunk(type="token", content=f"\n\n📝 *NEUROS Core capturing and compiling profile asset: `{filename}`...*\n")
                    yield f"data: {status_chunk.model_dump_json()}\n\n"
                    
                    result = file_system_service.write_local_file(filename, file_data)
                    
                    if filename == "professional_profile.json":
                        try:
                            profile_json = json.loads(file_data)
                            profile_service.save_profile_data(profile_json)
                        except Exception as json_parse_err:
                            print(f"──> [ROUTER WARNING] Profile Data capture schema failed validation: {json_parse_err}")

                    output_decorator = f"\n✅ *System Message*: {result['output']}\n"
                    full_response += status_chunk.content + output_decorator
                    yield f"data: {StreamChunk(type='token', content=output_decorator).model_dump_json()}\n\n"
                except Exception as file_sys_err:
                    err_dec = f"\n⚠️ [File Subsystem Collision]: {file_sys_err}\n"
                    full_response += err_dec
                    yield f"data: {StreamChunk(type='token', content=err_dec).model_dump_json()}\n\n"

            # ─── INTERCEPTOR LAYER C: SANDBOX SCRIPT EXECUTION ───
            if ":::RUN_SCRIPT:::" in full_response and (":::END:::" in full_response or ":::END::" in full_response):
                try:
                    end_marker = ":::END:::" if ":::END:::" in full_response else ":::END::"
                    parts = full_response.split(":::RUN_SCRIPT:::")
                    filename = parts[1].split(end_marker)[0].strip()
                    
                    status_chunk = StreamChunk(type="token", content=f"\n\n🚀 *NEUROS Core initializing local sandbox runtime for: `{filename}`...*\n")
                    yield f"data: {status_chunk.model_dump_json()}\n\n"
                    
                    result = sandbox_service.execute_python_script(filename)
                    output_decorator = f"\n```python-sandbox\n{result['output']}\n```\n"
                    
                    full_response += status_chunk.content + output_decorator
                    yield f"data: {StreamChunk(type='token', content=output_decorator).model_dump_json()}\n\n"
                except Exception as sandbox_err:
                    err_dec = f"\n⚠️ [Sandbox Subsystem Collision]: {sandbox_err}\n"
                    full_response += err_dec
                    yield f"data: {StreamChunk(type='token', content=err_dec).model_dump_json()}\n\n"

            # Persist response and title lazy trigger
            assistant_msg = await conv_service.add_message(
                db=db, conversation_id=request.conversation_id, role=MessageRole.assistant, content=full_response, model=request.model
            )
            await vector_service.upsert_message(assistant_msg.id, request.conversation_id, MessageRole.assistant.value, full_response)

            if len(historical_messages) == 0:
                try:
                    await conv_service.auto_title(db, request.conversation_id, user_content)
                except Exception as title_err:
                    print(f"──> [ROUTER WARNING] Auto-titling deferred: {title_err}")

            done_chunk = StreamChunk(type="done", message_id=assistant_msg.id, conversation_id=request.conversation_id)
            yield f"data: {done_chunk.model_dump_json()}\n\n"

        except Exception as e:
            error_chunk = StreamChunk(type="error", error=str(e))
            yield f"data: {error_chunk.model_dump_json()}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )