import { google } from "googleapis";

if (!process.env.SPREADSHEET_ID) {
  throw new Error("SPREADSHEET_ID environment variable is not set");
}

const spreadsheetId = process.env.SPREADSHEET_ID;

function getSheets(isReadOnly = false) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      universe_domain: "googleapis.com",
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
      client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets" + (isReadOnly ? ".readonly" : "")],
  });

  return google.sheets({ version: "v4", auth });
}

export async function getValues(range: string) {
  const sheets = getSheets(true);

  return await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
}

export async function setValues(range: string, values: string[][]) {
  const sheets = getSheets();
  const resource = { values };

  return await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: resource,
  });
}

export async function clearValues(range: string) {
  const sheets = getSheets();

  return await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
}