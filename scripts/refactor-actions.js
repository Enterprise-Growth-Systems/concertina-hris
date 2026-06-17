const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, '../src'), function(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace (session.user as any).role -> session.user.role
    content = content.replace(/\(session\.user as any\)\.role/g, 'session?.user?.role');
    content = content.replace(/\(session\.user as any\)\.id/g, 'session?.user?.id');
    content = content.replace(/\(session\.user as any\)\.requiresPasswordChange/g, 'session?.user?.requiresPasswordChange');
    content = content.replace(/\(user as any\)\.role/g, 'user.role');
    content = content.replace(/\(user as any\)\.password/g, 'user.password');
    content = content.replace(/\(req\.auth\?\.user as any\)\?\.role/g, 'req.auth?.user?.role');
    content = content.replace(/\(req\.auth\?\.user as any\)\?\.requiresPasswordChange/g, 'req.auth?.user?.requiresPasswordChange');
    content = content.replace(/session\?\.user as any/g, 'session?.user');
    
    // Replace PrismaClient initialization
    // from:
    // import { PrismaClient } from "@prisma/client";\n\nconst prisma = new PrismaClient();
    // to:
    // import prisma from "@/lib/prisma";
    content = content.replace(
        /import\s*{\s*PrismaClient\s*}\s*from\s*["']@prisma\/client["'];[\s\n]*const\s+prisma\s*=\s*new\s+PrismaClient\(\);/g,
        'import prisma from "@/lib/prisma";'
    );
    
    content = content.replace(/import\s*{\s*PrismaClient\s*}\s*from\s*["']@prisma\/client["'];/g, 'import prisma from "@/lib/prisma";');
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Refactoring complete.");
