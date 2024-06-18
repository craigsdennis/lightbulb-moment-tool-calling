import { Hono } from 'hono';
import { assert } from 'vitest';

type Env = {
	GOVEE_DEVICE_ID: string;
	GOVEE_MODEL_ID: string;
	GOVEE_API_KEY: string;
	AI: Ai;
};

const app = new Hono<{ Bindings: Env }>();

async function changeLightColor(env: Env, r: number, g: number, b: number) {
	const request = {
		device: env.GOVEE_DEVICE_ID,
		model: env.GOVEE_MODEL_ID,
		cmd: {
			name: 'color',
			value: {
				r,
				g,
				b,
			},
		},
	};
	const result = await fetch('https://developer-api.govee.com/v1/devices/control', {
		headers: {
			'Content-Type': 'application/json',
			'Govee-API-Key': env.GOVEE_API_KEY,
		},
		method: 'PUT',
		body: JSON.stringify(request),
	});
	return `Changed light color Red: ${r}, Green: ${g}, Blue: ${b}`;
}

app.post('/api/light', async (c) => {
	const payload = await c.req.json();
	const result = await changeLightColor(c.env, payload.r, payload.g, payload.b);
	return c.json(result);
});

app.post('/chat', async (c) => {
	const payload = await c.req.json();
	const messages = payload.messages || [];
	messages.unshift({
		role: "system",
		content: `You are a Home Automation assistant named Homie.

		You will listen to the user's conversation and do your best to configure the home to match the conversation`
	});
	const tools = [
		{
			name: 'switchLightColor',
			description: 'Changes the light color and changing the mood of the room',
			parameters: {
				type: 'object',
				properties: {
					r: {
						type: 'number',
						description: 'The red value of the RGB of the color. Between 0 and 255.',
					},
					g: {
						type: 'number',
						description: 'The green value of the RGB of the color. Between 0 and 255.',
					},
					b: {
						type: 'number',
						description: 'The blue value of the RGB of the color. Between 0 and 255.',
					},
				},
				required: ['r', 'g', 'b'],
			},
		},
	];
	let result: AiTextGenerationOutput = await c.env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
		messages,
		tools,
	});
	while (result.tool_calls !== undefined) {
		for (const tool_call of result.tool_calls) {
			switch (tool_call.name) {
				case 'switchLightColor':
					const fnResponse = await changeLightColor(c.env, tool_call.arguments.r, tool_call.arguments.g, tool_call.arguments.b);
					messages.push({ role: 'tool', name: tool_call.name, content: JSON.stringify(fnResponse) });
					console.log({ messages, messagesJSON: JSON.stringify(messages) });
					result = await c.env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
						messages,
						tools,
					});
					console.log({ result });
					if (result.response !== null) {
						messages.push({ role: 'assistant', content: result.response });
					}
					break;
				default:
					console.warn(`Tool not found: ${tool_call.name}`);
					break;
			}
		}
	}
	return c.json(result);
});

export default app;
