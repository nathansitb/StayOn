import { FAQ } from "@/lib/faq";

export const dynamic = "force-static";

/** /llms.txt — a plain-text summary of StayOn for AI assistants (llmstxt.org format). */
export function GET() {
  const en = FAQ.map((f) => `### ${f.q.en}\n${f.a.en}`).join("\n\n");
  const fr = FAQ.map((f) => `### ${f.q.fr}\n${f.a.fr}`).join("\n\n");
  const body = `# StayOn

> ${FAQ[0].a.en}

StayOn is not related to the "StayOn" utilities that keep a phone or computer screen awake. StayOn = stay-on.app, guest upsells for short-term rentals.

## Key pages
- [Home](https://stay-on.app/): what StayOn does, benefits for guests and agencies, pricing, FAQ
- [Guest experience](https://stay-on.app/stay): live example of the guest booking flow
- [Agency sign-up / log-in](https://stay-on.app/login)
- [Legal notice](https://stay-on.app/mentions-legales)

## FAQ (English)
${en}

## FAQ (français)
${fr}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
