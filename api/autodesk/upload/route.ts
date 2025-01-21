import { NextResponse } from 'next/server';
// import axios from 'axios';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

// Utility function to read the entire stream into a Buffer
async function readRequestBody(req: Request): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = req.body?.getReader();
  if (!reader) {
    throw new Error('Request body is empty or could not be read');
  }

  let done = false;

  while (!done) {
    const { value, done: isDone } = await reader.read();
    if (value) {
      chunks.push(value); // Collect chunks
    }
    done = isDone;
  }

  return Buffer.concat(chunks); // Combine all chunks into a single Buffer
}

function processUrl(url: string) {
  const [before, after] = url.split("&uploadId");
  return `${decodeURIComponent(before)}&uploadId${after}`;
}

export async function PUT(req: Request) {
  const url = new URL(req.url); // Get the full URL

  const rawUploadUrl = url.search.substring("?upload_url=".length);
  const uploadUrl = decodeURI(rawUploadUrl);
  const processedUrl = processUrl(rawUploadUrl);
  try {
    // Aggregate the request body into a single Buffer
    const buffer = await readRequestBody(req);
    console.log('url=', url);
    console.log('url search =', url.search);

    console.log('rawUploadUrl=', rawUploadUrl);
    console.log('uploadUrl=', uploadUrl);
    console.log('processed url=', processedUrl);

    // call AutoDesk API to upload file to S3
    const autoDeskResponse = await fetch(processedUrl ?? '', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    return NextResponse.json({
      message: 'File successfully uploaded!',
      dataLength: buffer.length,
      data: autoDeskResponse,
      rawUrl: rawUploadUrl,
      requestUrl: uploadUrl
    });
  } catch (error) {
    console.error('Error reading request body:', error);
    return NextResponse.json(
      { error: 'Failed to process request body' },
      { status: 500 }
    );
  }
}
