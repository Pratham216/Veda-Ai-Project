"use client";

import { jsPDF } from "jspdf";
import type { Assignment } from "@/store/useAssignmentStore";

type DifficultyColor = [number, number, number];
const DIFFICULTY_COLORS: Record<string, DifficultyColor> = {
  Easy: [22, 101, 52], // green-800
  Moderate: [146, 64, 14], // amber-800
  Challenging: [159, 18, 57], // rose-800
};

const PAGE = {
  width: 595.28, // A4 width in pt
  height: 841.89,
  marginX: 56,
  marginY: 56,
};

export function downloadAssignmentPdf(a: Assignment): void {
  const r = a.result;
  if (!r) return;

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const contentWidth = PAGE.width - PAGE.marginX * 2;
  let y = PAGE.marginY;

  const newPageIfNeeded = (h: number) => {
    if (y + h > PAGE.height - PAGE.marginY) {
      doc.addPage();
      y = PAGE.marginY;
    }
  };

  const writeLine = (
    text: string,
    opts: { size?: number; style?: "normal" | "bold" | "italic"; align?: "left" | "center" | "right"; color?: [number, number, number] } = {},
  ) => {
    const { size = 11, style = "normal", align = "left", color = [24, 24, 24] } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = size * 1.35;
    newPageIfNeeded(lines.length * lineHeight + 2);
    const x =
      align === "center"
        ? PAGE.width / 2
        : align === "right"
          ? PAGE.width - PAGE.marginX
          : PAGE.marginX;
    doc.text(lines, x, y, { align });
    y += lines.length * lineHeight;
  };

  const writeQuestion = (
    index: number,
    difficulty: string,
    text: string,
    marks: number,
  ) => {
    const size = 11;
    const lineHeight = size * 1.4;
    const indent = 18;
    const indexStr = `${index}.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(24, 24, 24);

    const tagText = `[${difficulty}]`;
    const tagWidth = doc.getTextWidth(tagText);
    const marksText = ` [${marks} Marks]`;

    // Wrap question text to fit after the tag
    const indexWidth = doc.getTextWidth(indexStr) + 4;
    const wrapWidth = contentWidth - indent - tagWidth - 6;
    const lines = doc.splitTextToSize(text + marksText, wrapWidth);
    newPageIfNeeded(lines.length * lineHeight + 4);

    // index
    doc.text(indexStr, PAGE.marginX, y);

    // difficulty tag in colour
    const tagColor = DIFFICULTY_COLORS[difficulty] ?? [80, 80, 80];
    doc.setTextColor(...tagColor);
    doc.setFont("helvetica", "bold");
    doc.text(tagText, PAGE.marginX + indexWidth, y);

    // body text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(24, 24, 24);
    const bodyX = PAGE.marginX + indexWidth + tagWidth + 6;
    doc.text(lines[0] ?? "", bodyX, y);
    for (let i = 1; i < lines.length; i++) {
      y += lineHeight;
      newPageIfNeeded(lineHeight);
      doc.text(lines[i], PAGE.marginX + indent, y);
    }
    y += lineHeight + 2;
  };

  // === HEADER ===
  writeLine(r.schoolName, { size: 16, style: "bold", align: "center" });
  y += 4;
  writeLine(`Subject: ${r.subject}`, { size: 11, align: "center" });
  writeLine(`Class: ${r.className}`, { size: 11, align: "center" });
  y += 12;

  // Time / marks row
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 24);
  newPageIfNeeded(20);
  doc.text(`Time Allowed: ${r.timeAllowedMinutes} minutes`, PAGE.marginX, y);
  doc.text(`Maximum Marks: ${r.maximumMarks}`, PAGE.width - PAGE.marginX, y, { align: "right" });
  y += 18;
  writeLine("All questions are compulsory unless stated otherwise.", { size: 11 });

  // Student info lines
  y += 8;
  const dashed = (label: string) => {
    newPageIfNeeded(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 24);
    doc.text(label, PAGE.marginX, y);
    const labelW = doc.getTextWidth(label);
    doc.setDrawColor(169, 169, 169);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(PAGE.marginX + labelW + 6, y + 2, PAGE.width - PAGE.marginX, y + 2);
    doc.setLineDashPattern([], 0);
    y += 18;
  };
  dashed("Name:");
  dashed("Roll Number:");
  dashed(`Class: ${r.className}  Section:`);

  // === SECTIONS ===
  for (const s of r.sections) {
    y += 16;
    writeLine(s.title, { size: 14, style: "bold", align: "center" });
    y += 4;
    if (s.instruction) {
      writeLine(s.instruction, { size: 11, style: "italic" });
    }
    y += 4;
    s.questions.forEach((q, i) => {
      writeQuestion(i + 1, q.difficulty, q.text, q.marks);
    });
  }

  // End marker
  y += 12;
  writeLine("— End of Question Paper —", { size: 11, style: "italic", align: "center" });

  // === ANSWER KEY ===
  if (r.answerKey && r.answerKey.length > 0) {
    doc.addPage();
    y = PAGE.marginY;
    writeLine("Answer Key", { size: 14, style: "bold" });
    y += 8;
    r.answerKey.forEach((line, i) => {
      const lineHeight = 11 * 1.4;
      const text = `${i + 1}. ${line}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 24);
      const lines = doc.splitTextToSize(text, contentWidth);
      newPageIfNeeded(lines.length * lineHeight + 6);
      doc.text(lines, PAGE.marginX, y);
      y += lines.length * lineHeight + 6;
    });
  }

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, PAGE.width / 2, PAGE.height - 24, { align: "center" });
  }

  const safeTitle = (a.title || "assignment").replace(/[^\w-]+/g, "-").toLowerCase();
  doc.save(`${safeTitle}.pdf`);
}
