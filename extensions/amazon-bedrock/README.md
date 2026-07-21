# NodoAssist Amazon Bedrock Provider

Official NodoAssist provider plugin for Amazon Bedrock. It adds Bedrock model discovery, text generation, embeddings, and guardrail-aware provider routing for agents that use AWS-hosted models.

Install from NodoAssist:

```bash
nodoassist plugin add @nodoassist/amazon-bedrock-provider
```

Configure AWS credentials and region through your normal NodoAssist credential/profile setup, then select Bedrock models with the `amazon-bedrock/...` provider prefix.
