from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List, Dict, Any
from .tools.file_system_tools import ListDirectoryTool # 导入 ListDirectoryTool
from .tools.rename_move_tool import RenameMoveFileTool # 导入 RenameMoveFileTool
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

@CrewBase
class NlpTools():
    """NlpTools crew"""

    agents: List[BaseAgent]
    tasks: List[Task]
    # 添加 agents_config 和 tasks_config 的类型提示
    agents_config: Dict[str, Any]
    tasks_config: Dict[str, Any]

    # Learn more about YAML configuration files here:
    # Agents: https://docs.crewai.com/concepts/agents#yaml-configuration-recommended
    # Tasks: https://docs.crewai.com/concepts/tasks#yaml-configuration-recommended
    
    # If you would like to add tools to your agents, you can learn more about it here:
    # https://docs.crewai.com/concepts/agents#agent-tools
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'], # type: ignore[index]
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'], # type: ignore[index]
            verbose=True
        )

    # 定义一个新的数据处理 Agent
    @agent
    def data_processor(self) -> Agent:
        return Agent(
            config=self.agents_config['data_processor'], # 需要在 agents.yaml 中配置 data_processor
            verbose=True,
            description="""
            专门负责处理和分析文本数据的 Agent。
            它能够进行数据清洗、文本预处理、特征提取以及执行各种复杂的NLP任务，
            如情感分析、命名实体识别（NER）、文本摘要、关键词提取、机器翻译等。
            该Agent能够理解并转换非结构化文本数据为可用于进一步分析或报告的结构化格式。
            """,
            # 您可以在这里添加工具，例如用于文件读写、文本清洗、数据解析等的工具
            # tools=[
            #     # MyCustomTool(), # 现有工具示例
            #     # 工具示例：情感分析工具 (SentimentAnalysisTool)
            #     # SentimentAnalysisTool(name="Sentiment Analyzer", description="根据文本判断情感倾向"),
            #     # 工具示例：命名实体识别工具 (NamedEntityRecognitionTool)
            #     # NamedEntityRecognitionTool(name="NER Extractor", description="从文本中识别并提取命名实体"),
            #     # 工具示例：文本摘要工具 (TextSummarizerTool)
            #     # TextSummarizerTool(name="Text Summarizer", description="对长文本进行摘要，提取核心内容"),
            #     # 工具示例：关键词提取工具 (KeywordExtractorTool)
            #     # KeywordExtractorTool(name="Keyword Extractor", description="从文本中提取相关关键词"),
            #     # 工具示例：翻译工具 (TranslationTool)
            #     # TranslationTool(name="Translator", description="将文本从一种语言翻译成另一种语言"),
            #     # 更多工具...
            # ]
        )

    # 定义一个新的协调 Agent，负责管理和调度 NLP 任务
    @agent
    def orchestrator_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['orchestrator_agent'], # 需要在 agents.yaml 中配置 orchestrator_agent
            verbose=True,
            description="""
            高级协调 Agent，负责管理和调度整个 NLP 处理流程。
            它能够识别需要处理的数据批次或流，并持续触发数据处理 Agent（data_processor）来执行其任务。
            该Agent确保数据的顺畅流动，并可以处理任务间的依赖、错误恢复以及结果的整合。
            """,
            tools=[
                ListDirectoryTool(), # 添加 ListDirectoryTool
                RenameMoveFileTool(), # 添加 RenameMoveFileTool
                # DataQueueMonitorTool(name="Data Queue Monitor", description="监控待处理数据的队列"),
                # WorkflowManagementTool(name="Workflow Manager", description="管理和调度 NLP 任务的执行"),
            ]
        )

    # 定义一个新的文本校对员 Agent，负责校对处理后的数据是否合规
    @agent
    def proofreader_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['proofreader_agent'], # 需要在 agents.yaml 中配置 proofreader_agent
            verbose=True,
            description="""
            专业的文本数据校对员和质量控制专家。
            该Agent负责审查 data_processor 处理后的结构化文本数据，
            检查其是否符合预定的规范、格式要求和内容准确性。
            如果发现数据不合规或存在错误，它能够提供详细的反馈，并触发数据重新处理流程。
            """,
            # 校对员Agent可能需要读取文件、执行数据验证规则、比较模式等工具
            tools=[
                # ReadFileTool(name="Read Processed Data", description="读取处理后的数据文件"),
                # DataValidationTool(name="Data Validator", description="根据预设规则验证数据合规性"),
                # FeedbackMechanismTool(name="Feedback Mechanism", description="提供不合规数据的详细反馈并触发重处理"),
            ]
        )

    # To learn more about structured task outputs,
    # task dependencies, and task callbacks, check out the documentation:
    # https://docs.crewai.com/concepts/tasks#overview-of-a-task
    @task
    def research_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_task'], # type: ignore[index]
        )

    @task
    def reporting_task(self) -> Task:
        return Task(
            config=self.tasks_config['reporting_task'], # type: ignore[index]
            output_file='report.md'
        )

    # 定义一个新的数据处理 Task
    @task
    def process_data_task(self) -> Task:
        return Task(
            config=self.tasks_config['process_data_task'], # 需要在 tasks.yaml 中配置 process_data_task
            agent=self.data_processor(), # 将数据处理任务分配给 data_processor Agent
            description="""
            接收原始的非结构化文本数据，进行全面的NLP处理。
            这包括但不限于：文本清洗（去除噪声）、分词、词性标注、句法分析，
            并根据具体需求执行情感分析、命名实体识别、主题建模、文本分类或信息抽取。
            **重要：最终输出的结构化数据中，每个文档应包含一个按处理顺序生成的唯一数字ID。**
            最终，将处理后的数据转换为清晰、一致且结构化的格式，例如 JSON、CSV 或其他预定义的 schema。
            """,
            expected_output="""
            处理后的结构化数据，例如：
            {
                "document_id": 1, # 示例：按处理顺序生成的唯一数字ID
                "extracted_entities": {
                    "persons": ["张三", "李四"],
                    "organizations": ["ABC公司"],
                    "locations": ["北京"]
                },
                "sentiment": "positive",
                "summary": "这是一段关于北京ABC公司新项目的积极总结。",
                "keywords": ["北京", "ABC公司", "项目", "积极"]
            }
            """,
            output_file='processed_nlp_data.json' # 将处理后的数据保存到 JSON 文件
            # context=[self.research_task()] # 如果这个任务依赖于 research_task 的输出，可以取消注释
        )

    # 定义一个新的任务，由 orchestrator_agent 负责持续调用 NLP Agent
    @task
    def orchestrate_nlp_tasks(self) -> Task:
        return Task(
            config=self.tasks_config['orchestrate_nlp_tasks'], # 需要在 tasks.yaml 中配置 orchestrate_nlp_tasks
            agent=self.orchestrator_agent(), # 将此任务分配给 orchestrator_agent
            description="""
            持续监控新的文本数据或未处理的数据流，并协调 data_processor Agent 进行处理。
            这个任务的目标是确保所有传入的非结构化数据都经过 NLP 处理并转换为结构化格式。
            它可能涉及迭代地调用 data_processor 任务，直到所有数据都被处理完毕，
            并处理任何中间结果或错误。
            """,
            expected_output="""
            所有传入文本数据都已成功处理并转换为结构化格式的确认。
            可能包含处理报告、已处理文件列表或任何异常汇总。
            例如："所有50个文本文件都已成功处理，并生成了结构化数据。"
            """,
            context=[self.proofreading_task()], # 此任务依赖于 proofreading_task 的输出
            # output_file='nlp_orchestration_report.md' # 可以选择将协调报告保存到文件
            # 这里可以添加逻辑来根据 proofreading_task 的输出结果，
            # 调用 RenameMoveFileTool 进行文件重命名和移动，
            # 或者重新触发 process_data_task。
            # 示例伪代码：
            # if proofreading_task.output.status == "approved":
            #     self.orchestrator_agent().run(RenameMoveFileTool(source_path=processed_nlp_data.json, destination_dir="approved_data", new_name=proofreading_task.output.suggested_filename))
            # else:
            #     self.orchestrator_agent().run(self.process_data_task.retry(context=proofreading_task.output.details.document_id))
        )

    # 定义一个新的校对任务，由 proofreader_agent 负责
    @task
    def proofreading_task(self) -> Task:
        return Task(
            config=self.tasks_config['proofreading_task'], # 需要在 tasks.yaml 中配置 proofreading_task
            agent=self.proofreader_agent(), # 将此任务分配给 proofreader_agent
            description="""
            审查 data_processor Agent 处理后的结构化文本数据，确保其合规性和质量。
            任务包括但不限于：
            1. 检查数据格式是否符合预期的 JSON/CSV schema。
            2. 验证提取的实体（如人名、地名）是否准确无误。
            3. 评估情感分析或摘要结果的合理性。
            如果数据不合规，则通过任务回调机制（Task Callbacks）将问题数据和详细反馈打回给 orchestrator_agent，由其协调 data_processor 重新处理。
            """,
            expected_output="""
            如果数据合规，则输出：
            {
                "status": "approved",
                "message": "数据合规，已通过校对。",
                "suggested_filename": "processed_data_<顺序编号>.json" # 示例：processed_data_1.json
            }
            如果数据不合规，则输出详细的错误报告，例如：
            {
                "status": "rejected",
                "message": "数据不合规：实体识别错误 - 在文档ID 'doc_005' 中，'齐天大圣' 未被识别为人名。",
                "details": {
                    "document_id": "doc_005",
                    "reason": "实体识别错误",
                    "suggestion": "调整NER模型参数或提供更多训练样本。"
                }
            }
            """,
            context=[self.process_data_task()], # 此任务以上一个数据处理任务的输出作为上下文
            # task_callback=self.handle_proofreading_feedback # 可以定义一个回调函数来处理打回逻辑
        )

    @crew
    def crew(self) -> Crew:
        """Creates the NlpTools crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents, # CrewBase 会自动包含所有 @agent 定义的 Agent
            tasks=[
                self.research_task(),
                self.reporting_task(),
                self.process_data_task(),
                self.proofreading_task(), # 添加校对任务
                self.orchestrate_nlp_tasks() # 编排任务在最后，以便它可以基于所有其他任务的输出进行协调
            ],
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )
