# AI Collaboration Disclosure

This repository was created using a Human × AI collaboration workflow.

## AI assistance used during development

ChatGPT (OpenAI) assisted with:
- Exploring and refining the project concept
- Proposing the architecture and module boundaries
- Drafting Python implementation code
- Suggesting test cases and debugging approaches
- Drafting project documentation

## Human responsibilities

The project owner is responsible for:
- Choosing the project direction and desired features
- Running the application and tests in their environment
- Reviewing generated code and understanding its behavior
- Identifying issues and deciding what changes to accept
- Maintaining the repository and accurately describing the work

AI assistance does not replace testing, review, or ownership of the final published repository.

## AI inside the application

CHAOSVERSE includes **ORACLE**, an in-app analytical agent. In this version, ORACLE uses explicit local rules and recent simulation data to identify trends, estimate risk, explain its reasoning, and suggest experiments.

ORACLE:
- Does not send simulation data to an external service
- Does not require an API key
- Is not a trained LLM or a scientifically validated predictor
- Can make simplistic or incorrect assessments

The term "AI" is used here in the broad sense of an autonomous, rule-based analytical agent. The README describes its limitations so users are not misled.

## Tools

- ChatGPT by OpenAI — development assistance
- Python and the open-source libraries listed in `requirements.txt`
