import { Context } from 'telegraf';

export const answerClosure = (() => {
  let messages: Map<number, number> = new Map(); // chat_id -> message_id

  return (ctx: Context, text: string) => {
    const dm = ctx.chat?.type === 'private';
    if (ctx.message?.message_id && ctx.chat?.id && !dm) {
      ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(() => {});
    }
    ctx.telegram.sendMessage(ctx.chat?.id ?? 0, text, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
      disable_notification: true,
    }).then((msg) => {
      if (ctx.chat?.id && messages.get(ctx.chat.id) && !dm) {
        ctx.telegram.deleteMessage(ctx.chat.id, messages.get(ctx.chat.id) ?? 0).catch(() => {});
      }
      messages.set(ctx.chat?.id ?? 0, msg.message_id);
    });
  };
});
