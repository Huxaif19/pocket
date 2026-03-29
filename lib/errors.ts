import { NextResponse } from "next/server";

export function errorResponse(
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { success: false, error: message, ...details },
    { status }
  );
}

export function validationError(message: string, field?: string): NextResponse {
  return errorResponse(message, 422, field ? { field } : undefined);
}