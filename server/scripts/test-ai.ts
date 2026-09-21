import "dotenv/config";
import { analyzeIssue } from "../src/ai/aiEngine.js";
import { IssueInput } from "../src/ai/types.js";

async function main() {
  console.log("=================================================");
  console.log("   ECOCIVIX AI Engine — ML Foundation Test CLI   ");
  console.log("=================================================\n");

  const sampleIssues: IssueInput[] = [
    {
      title: "Exposed High-Voltage Cable Near Primary School Gate",
      description: "A thick power cable has snapped and is hanging dangerously low right outside the main gate of St. Jude School. Sparks were observed earlier after rain.",
      locationContext: "Sector 14, Main Gate",
    },
    {
      title: "Burst Water Main Flooding Commercial Street",
      description: "Clean drinking water has been gushing out of a cracked 12-inch underground pipe since 5 AM. The entire market street is submerged under 6 inches of water.",
      locationContext: "Central Avenue Market",
    },
    {
      title: "Illegal Industrial Waste Dumping in River Drain",
      description: "Dark oily chemical liquid is being discharged from an unlabelled tanker truck into the storm drain leading into the local river.",
      locationContext: "North Bypass Road",
    },
    {
      title: "Deep Hazardous Pothole on Highway Off-Ramp",
      description: "Large 3-foot wide pothole with sharp edges. Multiple cars suffered tire punctures this evening.",
      locationContext: "Highway 44 Exit 12",
    }
  ];

  for (let i = 0; i < sampleIssues.length; i++) {
    const issue = sampleIssues[i];
    console.log(`-------------------------------------------------`);
    console.log(`[TEST CASE ${i + 1}] Title: ${issue.title}`);
    console.log(`Location: ${issue.locationContext}`);
    console.log(`Description: ${issue.description}`);
    console.log(`-------------------------------------------------`);

    const startTime = Date.now();
    const result = await analyzeIssue(issue);
    const duration = Date.now() - startTime;

    console.log("AI INTELLIGENCE ANALYSIS RESULT:");
    console.log(`- Category             : ${result.category}`);
    console.log(`- Priority             : ${result.priority}`);
    console.log(`- Department           : ${result.department}`);
    console.log(`- Environmental Impact : ${result.environmentalImpact} (${result.environmentalReason})`);
    console.log(`- Safety Risk          : ${result.safetyRisk} (${result.safetyReason})`);
    console.log(`- Summary              : ${result.summary}`);
    console.log(`- Suggested Action     : ${result.suggestedAction}`);
    console.log(`- Provider             : ${result.provider} (Fallback: ${result.isFallback})`);
    console.log(`- Latency              : ${duration} ms\n`);
  }

  console.log("=================================================");
  console.log("   ALL TEST CASES COMPLETED SUCCESSFULLY         ");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
