import translate from '@iamtraction/google-translate';

export const translateTextController = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    console.log('Translation request:', { text, targetLanguage });

    if (!text || !targetLanguage) {
      return res.status(400).json({
        message: 'Text and target language are required',
        success: false,
        error: true
      });
    }

    const result = await translate(text, { to: targetLanguage });

    console.log('Translation result:', result.text);

    return res.json({
      message: 'Translation successful',
      translatedText: result.text,
      success: true,
      error: false
    });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      message: error.message || 'Translation failed',
      error: true,
      success: false
    });
  }
};