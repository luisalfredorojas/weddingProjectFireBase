const SHEET_ID = 'PUT_YOUR_SHEET_ID_HERE'; // TODO: replace before deploying

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { invitee, plusOne, attending, allergies, timestamp } = body;
    if (!invitee) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Missing invitee' })).setMimeType(ContentService.MimeType.JSON).setResponseCode(400);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      timestamp || new Date(),
      invitee,
      plusOne ? 'Sí' : 'No',
      attending ? 'Sí' : 'No',
      allergies || ''
    ]);

    const output = ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return output;
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message || 'Error' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setResponseCode(500);
  }
}

function doOptions() {
  const output = ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}
