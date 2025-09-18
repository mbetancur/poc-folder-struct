import { xprisma } from "~/utils/prisma.server";
import { createClient } from "~/utils/supabase.server";
import type { BarkNode } from "~/routes/content-library.$";

export async function findParentNode(parentId: string): Promise<BarkNode | null> {
  return await xprisma.barkNode.findUnique({
    where: { id: parentId },
  });
}

export async function createFolder(parentNode: BarkNode, displayPath: string): Promise<BarkNode> {
  const newDisplayPath = `${displayPath}/New Folder`;

  const child = await xprisma.barkNode.createChild({
    node: parentNode,
    data: { name: "New Folder", isFolder: true, displayPath: newDisplayPath }
  });

  console.log("Successfully created folder:", child);
  return child;
}

export async function uploadFileToSupabase(
  request: Request,
  file: File,
  filePath: string
): Promise<{ supabasePath: string; bucketName: string }> {
  const { supabase } = createClient(request);
  const bucketName = 'CMS';

  const arrayBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  return {
    supabasePath: data.path,
    bucketName: bucketName
  };
}

export async function createFile(
  parentNode: BarkNode,
  displayPath: string,
  file: File,
  request: Request
): Promise<BarkNode> {
  const fileName = file.name;
  const newDisplayPath = `${displayPath}/${fileName}`;

  const supabaseFilePath = `uploads/${fileName}`;

  const { supabasePath } = await uploadFileToSupabase(
    request,
    file,
    supabaseFilePath
  );

  const child = await xprisma.barkNode.createChild({
    node: parentNode,
    data: {
      name: fileName,
      isFolder: false,
      displayPath: newDisplayPath,
      supabasePath: supabasePath,
    }
  });

  console.log("Successfully created file with Supabase path:", child);
  return child;
}

export async function handleContentAction(
  intent: string,
  parentId: string,
  displayPath: string,
  file: File,
  request: Request
): Promise<BarkNode> {
  const futureParentNode = await findParentNode(parentId);

  if (!futureParentNode) {
    throw new Error("Parent node not found");
  }

  switch (intent) {
    case "create-folder":
      return await createFolder(futureParentNode, displayPath);
    case "upload-file":
      return await createFile(futureParentNode, displayPath, file, request);
    default:
      throw new Error("Invalid intent");
  }
}
