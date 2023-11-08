import * as dotenv from "dotenv";
dotenv.config();

export default class Reply {
  constructor() {
    this.conversationId = undefined;
    (this.author = {
      type: "business",
      displayName: process.env.BOT_NAME ?? "Bugs Bunny",
      avatarUrl:
        process.env.BOT_AVATAR_URL ??
        "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png",
    }),
      (this.message = undefined);
    this.image = undefined;
    this.metadata = undefined;
  }
}
