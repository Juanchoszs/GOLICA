export const downloadImage = (uri: string, name: string) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportBoardToJSON = (elements: Array<Record<string, unknown>>, lines: Array<Record<string, unknown>>) => {
  const data = JSON.stringify({ elements, lines }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tactical_board_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
