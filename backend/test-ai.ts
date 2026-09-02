import { AiService } from "./src/services/ai.service";

async function test() {
    try {
        console.log("Testing generateCourse...");
        const res = await AiService.generateCourse("Math");
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
