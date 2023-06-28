// Using Mailjet
// import mailjet from "node-mailjet";

// const mailClient = new mailjet({
//   apiKey: process.env.MJ_APIKEY_PUBLIC,
//   apiSecret: process.env.MJ_APIKEY_PRIVATE,
// });

// export async function sendMail(
//   recipient: string,
//   recipientName: string,
//   subject: string,
//   html: string,
//   text?: string
// ) {
//   const request = mailClient.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: "adeelch30ty@gmail.com",
//           Name: "The Crib",
//         },
//         To: [
//           {
//             Email: recipient,
//             Name: recipientName,
//           },
//         ],
//         Subject: subject,
//         TextPart: text,
//         HTMLPart: html,
//       },
//     ],
//   });

//   return request;
// }

// export default mailClient;

import sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(process.env.SG_APIKEY!);

export default sendGrid;
