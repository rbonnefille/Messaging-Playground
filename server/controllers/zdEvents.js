// import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

// const {
//   ZD_SUBDOMAIN: subdomain,
//   ZD_USERNAME: username,
//   ZD_PASSWORD: password,
// } = process.env;

// const auth = {
//   username: username,
//   password: password,
// };

const zdEvents = async (req, res) => {
  console.log(req.body);
  return res.sendStatus(200).end();
  // const {
  //   type: eventType,
  //   detail: { external_id, email },
  // } = req.body;
  // if (external_id) {
  //   console.log("nothing to process");
  //   res.sendStatus(200).end();
  // }

  // if (eventType.startsWith("zen:event-type:organization") && !external_id) {
  //   const {
  //     detail: { id: orgId, name },
  //   } = req.body;
  //   const config = {
  //     method: "PUT",
  //     url: `https://${subdomain}.zendesk.com/api/v2/organizations/${orgId}.json`,
  //     data: {
  //       organization: {
  //         external_id: name,
  //       },
  //     },
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     auth: auth,
  //   };
  //   try {
  //     const response = await axios.request(config);
  //     console.log(response.data);
  //     res.sendStatus(200).end();
  //   } catch (e) {
  //     // catch error
  //     throw new Error(e);
  //   }
  // } else if (
  //   eventType.startsWith("zen:event-type:user") &&
  //   !external_id &&
  //   eventType !== "zen:event-type:user.name_changed" &&
  //   email
  // ) {
  //   const {
  //     detail: { id: userId, email },
  //   } = req.body;
  //   const config = {
  //     method: "PUT",
  //     url: `https://${subdomain}.zendesk.com/api/v2/users/${userId}.json`,
  //     data: {
  //       user: {
  //         external_id: email,
  //       },
  //     },
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     auth: auth,
  //   };
  //   try {
  //     const response = await axios.request(config);
  //     console.log(response.data);
  //     res.sendStatus(200).end();
  //   } catch (e) {
  //     // catch error
  //     throw new Error(e);
  //   }
  // }
};

export default zdEvents;
