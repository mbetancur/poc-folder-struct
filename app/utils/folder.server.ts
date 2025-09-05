import { xprisma } from "~/utils/prisma.server";


// TODO Sync this with Bucket name?? - validate Bussiness rules
export async function createRootFolder(name: string) {
  if (!name || name.trim() === "") {
    throw new Error("Folder name is required");
  }

  const folderName = name.trim();
  const displayPath = `/${folderName}`;

  try {
    const newFolder = await xprisma.folder.createRoot({
      data: {
        name: folderName,
        displayPath: displayPath
      }
    });

    return newFolder;
  } catch (error) {
    console.error("Error creating root folder:", error);
    throw new Error("Failed to create folder");
  }
}

export async function getAllRootFolders() {
  try {
    const folders = await xprisma.folder.findMany({
      where: {
        depth: 1
      },
      include: {
        files: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return folders;
  } catch (error) {
    console.error("Error fetching root folders:", error);
    throw new Error("Failed to fetch folders");
  }
}

export async function createChildFolder(parentId: string, name: string) {
  if (!name || name.trim() === "") {
    throw new Error("Folder name is required");
  }

  if (!parentId) {
    throw new Error("Parent folder is required");
  }

  const folderName = name.trim();

  try {
    const parentFolder = await xprisma.folder.findUnique({
      where: { id: parentId }
    });

    if (!parentFolder) {
      throw new Error("Parent folder not found");
    }

    const displayPath = `${parentFolder.displayPath}/${folderName}`;

    const newFolder = await xprisma.folder.createChild({
      node: parentFolder,
      data: {
        name: folderName,
        displayPath: displayPath
      },
      select: { name: true }
    });

    return newFolder;
  } catch (error) {
    console.error("Error creating child folder:", error);
    throw new Error("Failed to create child folder");
  }
}