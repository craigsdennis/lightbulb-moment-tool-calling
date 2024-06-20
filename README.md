# Homie - Home Automation Chat

This is a [Workers AI](https://developers.cloudflare.com/workers-ai/) application that makes use of Tool Calling using the [Hermes 2 Pro on Mistral 7B](https://developers.cloudflare.com/workers-ai/models/hermes-2-pro-mistral-7b/) model.

It adds the ability to control a [Govee](https://us.govee.com/) light device through English controls by making use of a Large Language Model.

[<img src="https://img.youtube.com/vi/Id5oKCa__IA/0.jpg">](https://youtu.be/Id5oKCa__IA "Lightbulb Moment Tool/Function Calling - YouTube walkthrough")

NOTE: It will still "work" without owning a light, but it would be a lot cooler if you did.

📚 [Function Calling Documentation](https://developers.cloudflare.com/workers-ai/configuration/function-calling/)

## Installation

If you have a light:

Copy [.dev.vars.example](./.dev.vars.example) to `.dev.vars` and add your `GOVEE_API_KEY`;

```bash
npm install
```

```bash
# If it's your first time here
npx wrangler login
```

## Develop

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```



