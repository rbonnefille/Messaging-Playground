let CLIENT = null;
let APP_SETTINGS = null;

const ZDClient = {
  init() {
    CLIENT = ZAFClient.init();
    CLIENT.on("app.registered", (data) => {
      APP_SETTINGS = data.metadata.settings;
    });
  },
  /**
   * Set getters for private objects
   */
  app: {
    get settings() {
      return APP_SETTINGS;
    },
  },

  /**
   * Calls ZAF Client.request()
   * @returns {Promise}
   */
  async request(url, data, options = {}) {
    return await CLIENT.request({
      url,
      data,
      contentType: "application/json",
      ...options,
    });
  },

  /**
   * It sets the frame height using on the passed value.
   * If no value has been passed, 80 will be set as default heigth.
   * @param {Int} newHeight
   */
  resizeFrame(appHeight) {
    CLIENT.invoke("resize", { width: "100%", height: `${appHeight + 12}px` });
  },

  /**
   * Notify user that something happened
   * Usually after taking some action
   * @param {string} message
   * @param {string} type
   * @param {number} durationInMs
   */
  notifyUser(message, type = "error", durationInMs = 5000) {
    CLIENT.invoke("notify", message, type, durationInMs);
  },

  /**
   * Calls ZAF Client.get()
   * @param {String} getter
   * @param {Boolean} custom
   * @returns {Object}
   */
  async get(getter, custom = false) {
    if (custom) {
      return (await CLIENT.get(getter))[getter];
    }
    return await CLIENT.get(getter);
  },

  async updateTicket(ticketId, province) {
    try {
      const payload = {
        ticket: {
          tags: [province],
        },
      };
      await ZDClient.request(
        `/api/v2/tickets/${ticketId}.json`,
        JSON.stringify(payload),
        {
          type: "PUT",
        }
      );
    } catch (error) {
      console.error("Error updateTicket: ", error);
      throw error;
    }
  },
};

export default ZDClient;
