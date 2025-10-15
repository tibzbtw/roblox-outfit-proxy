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
      headers: { 'User-Agent': 'Roblox/WinInet', 'Accept': 'application/json' },
      timeout: 10000
    });

    const allOutfits = response.data.data;

    // 🔍 Fetch details for each outfit (to filter out heads & bundles)
    const filtered = [];
    for (const outfit of allOutfits) {
      try {
        const detailUrl = `https://avatar.roblox.com/v1/outfits/${outfit.id}/details`;
        const details = await axios.get(detailUrl, { timeout: 8000 });

        const hasClothing = details.data.assets.some(a => {
          const t = a.assetType?.name || "";
          return t === "Shirt" || t === "Pants" || t === "TShirt";
        });

        if (hasClothing) {
          filtered.push({ Id: outfit.id, Name: outfit.name });
        }
      } catch (err) {
        console.warn(`Failed to fetch details for outfit ${outfit.id}: ${err.message}`);
      }
    }

    console.log(`✅ Found ${filtered.length} real outfits for user ${userId}`);

    res.json({
      success: true,
      userId,
      count: filtered.length,
      outfits: filtered
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
