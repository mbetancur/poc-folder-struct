import { xprisma } from "~/utils/prisma.server";
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

export async function createFile(parentNode: BarkNode, displayPath: string): Promise<BarkNode> {
  const newDisplayPath = `${displayPath}/new-file.txt`;
  
  const child = await xprisma.barkNode.createChild({
    node: parentNode,
    data: { name: "new-file.txt", isFolder: false, displayPath: newDisplayPath }
  });
  
  console.log("Successfully created file:", child);
  return child;
}

export async function handleContentAction(
  intent: string, 
  parentId: string, 
  displayPath: string
): Promise<BarkNode> {
  const futureParentNode = await findParentNode(parentId);

  if (!futureParentNode) {
    throw new Error("Parent node not found");
  }

  switch (intent) {
    case "create-folder":
      return await createFolder(futureParentNode, displayPath);
    case "upload-file":
      return await createFile(futureParentNode, displayPath);
    default:
      throw new Error("Invalid intent");
  }
}
