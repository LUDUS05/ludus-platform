const QRCode = require('qrcode');

async function generateQRCode(payload) {
  const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const options = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 1,
    width: 256
  };

  const dataUrl = await QRCode.toDataURL(stringified, options);
  return { dataUrl };
}

module.exports = { generateQRCode };



