// app/api/tasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Task } from "@/types";

const TASKS_TAB = process.env.GOOGLE_SHEET_TASKS_TAB || 'TASKS';

export async function GET(req: NextRequest) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        universe_domain: "googleapis.com",
        client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
        private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
        client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1EC_4ui93st0K5hj1W2CVR6sljMk87SbPEE0Klp7-Ygg"; // Replace with your Google Sheets ID
    const range = `${TASKS_TAB}!A1:G`; // Using environment variable

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const tasks: Task[] = rows.map((row) => ({
      id: parseInt(row[0], 10),
      name: row[1],
      secondsCounted: parseInt(row[2], 10),
      remainingTime: parseInt(row[3], 10),
      lastModified: row[4] || null,
      startTime: null,
      pauseTime: null,
      stopTime: null,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { task } = await req.json();

  if (!task) {
    return NextResponse.json(
      { error: "Task data is required" },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        universe_domain: "googleapis.com",
        client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
        private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
        client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1EC_4ui93st0K5hj1W2CVR6sljMk87SbPEE0Klp7-Ygg"; // Replace with your Google Sheets ID
    const range = `${TASKS_TAB}!A${task.id}:E${task.id}`; // Using environment variable

    const values = [
      [
        task.id,
        task.name,
        task.secondsCounted,
        task.remainingTime,
        task.lastModified,
      ],
    ];

    const resource = {
      values,
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: resource,
    });

    return NextResponse.json({ message: "Task saved successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (id === undefined) {
    return NextResponse.json(
      { error: "Task ID is required" },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        universe_domain: "googleapis.com",
        client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
        private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
        client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1EC_4ui93st0K5hj1W2CVR6sljMk87SbPEE0Klp7-Ygg"; // Replace with your Google Sheets ID
    const range = `${TASKS_TAB}!A${id}:G${id}`; // Using environment variable

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}