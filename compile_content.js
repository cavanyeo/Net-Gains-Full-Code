const fs = require('fs');
const path = require('path');

const coursesFilePath = path.join(__dirname, 'data', 'courses.json');
const outputFilePath = path.join(__dirname, 'compiled_course_content.md');

try {
  const rawData = fs.readFileSync(coursesFilePath, 'utf8');
  const courses = JSON.parse(rawData);

  let markdownTemplate = `# Net Gains Full Course Content\n\n`;

  courses.forEach((course) => {
    markdownTemplate += `## Week ${course.weeks}: ${course.title}\n`;
    markdownTemplate += `*Description:* ${course.description}\n`;
    markdownTemplate += `*Total Coins:* ${course.total_coins}\n\n`;

    course.daily_tasks.forEach((day) => {
      markdownTemplate += `### Day ${day.day_number}: ${day.title}\n\n`;
      
      markdownTemplate += `#### Video\n`;
      markdownTemplate += `- Title: ${day.video_title}\n`;
      markdownTemplate += `- URL: ${day.video_url}\n\n`;

      markdownTemplate += `#### Challenge: ${day.challenge.title}\n`;
      markdownTemplate += `- Description: ${day.challenge.description}\n`;
      markdownTemplate += `- Coins: ${day.challenge.coins}\n\n`;

      markdownTemplate += `#### Task: ${day.task.title}\n`;
      markdownTemplate += `- Description: ${day.task.description}\n`;
      markdownTemplate += `- Coins: ${day.task.coins}\n\n`;

      markdownTemplate += `#### Quiz Questions\n`;
      day.quiz_questions.forEach((q, index) => {
        markdownTemplate += `${index + 1}. **${q.question}**\n`;
        q.options.forEach((opt, optIndex) => {
          const isCorrect = q.correct_answer === optIndex;
          const marker = isCorrect ? '[x]' : '[ ]';
          markdownTemplate += `   - ${marker} ${opt}\n`;
        });
        markdownTemplate += '\n';
      });

      markdownTemplate += `---\n\n`;
    });
  });

  fs.writeFileSync(outputFilePath, markdownTemplate, 'utf8');
  console.log('Successfully compiled course content to', outputFilePath);

} catch (err) {
  console.error('Error compiling course content:', err);
}
