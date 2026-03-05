const imports = [
    '@langchain/google-genai',
    '@langchain/groq',
    'langchain/vectorstores/memory',
    '@langchain/community/document_loaders/fs/pdf',
    'langchain/text_splitter',
    'langchain/agents',
    '@langchain/core/prompts',
    '@langchain/community/tools/tavily_search',
    'langchain/tools/retriever',
    '@langchain/core/tools'
];

async function check() {
    for (const imp of imports) {
        try {
            await import(imp);
        } catch (e) {
            if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
                console.log('FAIL_EXPORT: ' + imp);
            } else {
                console.log('FAIL_OTHER: ' + imp + ' ' + e.message);
            }
        }
    }
}
check();
