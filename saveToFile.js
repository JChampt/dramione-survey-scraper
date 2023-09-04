function saveToFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.textContent = 'Download ' + fileName;

  document.body.appendChild(a);
}

const testSave = 'save this text to file!';
saveToFile(testSave, 'saved.txt');
