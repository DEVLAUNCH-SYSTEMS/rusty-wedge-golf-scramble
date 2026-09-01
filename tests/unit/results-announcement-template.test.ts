import { describe, expect, it } from "vitest";

import { ORGANIZERS } from "@/lib/content/organizers";
import { buildResultsAnnouncementEmailContent } from "@/lib/email/results-announcement-template";

const templateInput = {
  tournamentName: "The Rusty Wedge Golf Scramble",
  tournamentYear: 2026,
  recipientFirstName: "Pat",
  resultsUrl: "https://rustywedge.example.com/teams",
};

describe("buildResultsAnnouncementEmailContent", () => {
  it("uses Rusty's approved message with personalization and a results CTA", () => {
    const content = buildResultsAnnouncementEmailContent(templateInput);

    expect(content.subject).toBe(
      "The Rusty Wedge Golf Scramble — Results Are Live",
    );
    expect(content.text).toContain("Hi Pat,");
    expect(content.text).toContain("Thanks to everyone for a great day on Friday!");
    expect(content.text).toContain("end of summer");
    expect(content.text).toContain("View final results: https://rustywedge.example.com/teams");
    expect(content.html).toContain("View Final Results");
    expect(content.html).toContain('href="https://rustywedge.example.com/teams"');
    expect(content.html).toContain("https://rustywedge.example.com/images/logo-hero.png");
    expect(content.html).toContain("2026 Final Results");
  });

  it("uses the public deployed logo during local development", () => {
    const content = buildResultsAnnouncementEmailContent({
      ...templateInput,
      resultsUrl: "http://localhost:3000/teams",
    });

    expect(content.html).toContain(
      "https://rusty-wedge-golf-scramble.vercel.app/images/logo-hero.png",
    );
    expect(content.html).toContain('href="http://localhost:3000/teams"');
    expect(content.html).toContain('alt="The Rusty Wedge Golf Scramble"');
    expect(content.html).toContain('width="110" height="110"');
  });

  it("keeps organizer contact details in the footer", () => {
    const content = buildResultsAnnouncementEmailContent(templateInput);

    for (const organizer of ORGANIZERS) {
      expect(content.text).toContain(organizer.name);
      expect(content.text).toContain(organizer.phone);
      expect(content.html).toContain(organizer.name);
      expect(content.html).toContain(organizer.phone);
    }
  });

  it("omits the raw results URL from visible HTML while keeping it in plain text", () => {
    const content = buildResultsAnnouncementEmailContent(templateInput);

    expect(content.text).toContain("https://rustywedge.example.com/teams");
    expect(content.html).not.toContain(
      "<p>https://rustywedge.example.com/teams</p>",
    );
    expect(content.html).not.toContain(
      ">https://rustywedge.example.com/teams<",
    );
  });

  it("uses brand styling cues aligned with the SaaS UI", () => {
    const content = buildResultsAnnouncementEmailContent(templateInput);

    expect(content.html).toContain("#0b1a35");
    expect(content.html).toContain("#c8a044");
    expect(content.html).toContain("border-radius:9999px");
    expect(content.html).toContain("Georgia,'Times New Roman',serif");
  });

  it("uses a neutral greeting when the first name is blank", () => {
    const content = buildResultsAnnouncementEmailContent({
      ...templateInput,
      recipientFirstName: "   ",
    });

    expect(content.text).toContain("Hi there,");
    expect(content.html).toContain("Hi there,");
  });
});
