const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Roblox Outfit Proxy Server',
    endpoints: {
      outfits: '/api/outfits?userId=USER_ID'
    }
  });
});

app.get('/api/outfits', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing userId parameter',
        example: '/api/outfits?userId=123456'
      });
    }

    console.log(`Fetching outfits for userId: ${userId}`);

    const url = `https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=50`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Roblox/WinInet',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const outfits = response.data.data.map(outfit => ({
      Id: outfit.id,
      Name: outfit.name
    }));

    console.log(`Found ${outfits.length} outfits for user ${userId}`);

    res.json({
      success: true,
      userId: userId,
      count: outfits.length,
      outfits: outfits
    });

  } catch (error) {
    console.error('Error fetching outfits:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});
