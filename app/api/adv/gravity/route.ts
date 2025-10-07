import { NextResponse } from "next/server";

const gravityMap = {
  leve: { key: "leve", label: "Leve", color: "#22c55e", joyColor: "success" },
  moderado: { key: "moderado", label: "Moderado", color: "#f59e0b", joyColor: "warning" },
  grave: { key: "grave", label: "Grave", color: "#ef4444", joyColor: "danger" },
};

export async function GET() {
  return NextResponse.json(gravityMap);
}
