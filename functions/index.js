const functions = require('firebase-functions');
const { google } = require('googleapis');

exports.appendRSVP = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const sheetId = functions.config().sheets?.id;
  if (!sheetId) {
    return res.status(500).json({ error: 'Missing sheets.id config' });
  }

  try {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const { invitee, plusOne, attending, allergies, timestamp } = req.body || {};

    if (!invitee) {
      return res.status(400).json({ error: 'Missing invitee' });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp || new Date().toISOString(), invitee, plusOne ? 'Yes' : 'No', attending ? 'Yes' : 'No', allergies || '']]
      }
    });

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to append RSVP' });
  }
});

exports.appendRSVPOptions = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send('');
});
