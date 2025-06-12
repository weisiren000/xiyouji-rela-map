from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List, Dict, Any
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
            # 您可以在这里添加工具，例如用于文件读写、文本清洗、数据解析等的工具
            # tools=[MyCustomTool()]
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
            # task 的描述应该清楚说明需要处理什么数据以及处理目标
            description="处理输入的文本数据，提取关键信息，并将其转换为结构化格式。",
            # 您可以设置任务的输入、输出格式，以及依赖的其他任务
            # expected_output="处理后的结构化数据（例如 JSON 格式）",
            # context=[self.research_task()] # 如果这个任务依赖于 research_task 的输出
        )

    @crew
    def crew(self) -> Crew:
        """Creates the NlpTools crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents, # CrewBase 会自动包含所有 @agent 定义的 Agent
            tasks=self.tasks, # CrewBase 会自动包含所有 @task 定义的 Task
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )
