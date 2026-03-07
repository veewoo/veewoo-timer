import { NextRequest, NextResponse } from "next/server";
import { clearValues, getValues, setValues } from "../../../services/googleService";

const TASKS_IN_PROGRESS_TAB = process.env.GOOGLE_SHEET_TASKS_IN_PROGRESS_TAB || 'TASKS_IN_PROGRESS';

export async function GET(req: NextRequest) {
  try {
    const response = await getValues(`${TASKS_IN_PROGRESS_TAB}!A1:C1`)

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: rows[0][0],
      startTime: rows[0][1]
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { taskId, startTime } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    await setValues(`${TASKS_IN_PROGRESS_TAB}!A1:C1`, [[taskId, startTime]]);
    return NextResponse.json({ id: taskId, startTime });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await clearValues(`${TASKS_IN_PROGRESS_TAB}!A1:C1`);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

