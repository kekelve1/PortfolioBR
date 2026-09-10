export default async function handler(req, res) {
    // Permite apenas método GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido. Use GET.' });
    }

    const { folderId } = req.query;

    if (!folderId) {
        return res.status(400).json({ error: 'Parâmetro folderId é obrigatório.' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'GOOGLE_API_KEY não configurada no ambiente da Vercel.'
        });
    }

    try {
        const queryParams = new URLSearchParams({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id,name,mimeType,thumbnailLink,videoMediaMetadata)',
            key: apiKey
        });

        const url = `https://www.googleapis.com/drive/v3/files?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorDetails = await response.text();
            return res.status(response.status).json({
                error: 'Erro na resposta do Google Drive API',
                status: response.status,
                details: errorDetails
            });
        }

        const data = await response.json();
        const files = data.files || [];

        // Filtra apenas arquivos de vídeo válidos
        const validFiles = files.filter(f =>
            (f.mimeType && f.mimeType.startsWith('video/')) ||
            (f.name && f.name.match(/\.(mp4|mov|webm)$/i))
        );

        // Cache na borda (Edge / CDN da Vercel) por 15 minutos (900s) e revalidação suave por 30 minutos (1800s)
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

        return res.status(200).json({ files: validFiles });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro interno ao consultar Google Drive',
            message: error.message
        });
    }
}
