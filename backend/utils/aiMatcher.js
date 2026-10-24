/**
 * Calculates text similarity scores using Hugging Face sentence-transformers model.
 * Falls back to a local Jaccard token similarity algorithm if API token is missing or request fails.
 * 
 * @param {string} sourceSentence - The base text (e.g., Gig title + description)
 * @param {string[]} sentencesArray - Array of texts to compare against (e.g., Freelancer skills/bios)
 * @returns {Promise<number[]>} - Array of similarity scores between 0 and 1
 */
const calculateSimilarity = async (sourceSentence, sentencesArray) => {
    if (!sentencesArray || sentencesArray.length === 0) {
        return [];
    }

    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    if (token) {
        try {
            console.log('🤖 Querying Hugging Face sentence similarity model...');
            
            // Safe timeout fetch to prevent blocking servers if HuggingFace is slow
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    inputs: {
                        source_sentence: sourceSentence,
                        sentences: sentencesArray
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const scores = await response.json();
                if (Array.isArray(scores)) {
                    console.log('✅ Hugging Face similarity scores retrieved successfully.');
                    return scores.map(score => Math.max(0, Math.min(1, parseFloat(score))));
                }
            }
            
            console.warn(`⚠️ Hugging Face API returned status: ${response.status}. Using fallback Jaccard matching.`);
        } catch (apiError) {
            console.warn('⚠️ Hugging Face Inference API failed. Using Jaccard text overlap matching. Error:', apiError.message);
        }
    } else {
        console.log('ℹ️ No HF_TOKEN found in backend env. Using local Jaccard text similarity engine.');
    }

    // LOCAL FALLBACK: Jaccard Word Token Overlap Similarity (case-insensitive, tokenized)
    return sentencesArray.map(targetText => {
        return calculateJaccardSimilarity(sourceSentence, targetText);
    });
};

/**
 * Local helper to compute word overlap Jaccard index
 */
const calculateJaccardSimilarity = (str1, str2) => {
    const getTokens = (text) => {
        if (!text) return new Set();
        return new Set(
            text
                .toLowerCase()
                .replace(/[^a-z0-9\s,]/g, ' ') // keep commas as separator helpers for skills list
                .split(/[\s,]+/)
                .map(word => word.trim())
                .filter(word => word.length > 2)
        );
    };

    const tokens1 = getTokens(str1);
    const tokens2 = getTokens(str2);

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    const intersection = new Set([...tokens1].filter(word => tokens2.has(word)));
    const union = new Set([...tokens1, ...tokens2]);

    // Return index value rounded to 3 decimals
    return parseFloat((intersection.size / union.size).toFixed(3));
};

module.exports = {
    calculateSimilarity,
    calculateJaccardSimilarity
};
