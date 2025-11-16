import fs from 'fs';
import * as glob from 'glob';
import path from 'path';

describe('Architecture Compliance', () => {
  // Lấy danh sách tất cả file, trừ chính folder tests
  const allFiles = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['src/**/*.test.{ts,tsx}', 'src/types/**'],
  });

  it('components and client-side code must NOT import prisma or db client directly', () => {
    const clientSideFiles = allFiles.filter(
      (file) =>
        file.includes('src/components/') ||
        file.match(/app\/.*\/page\.tsx$/) ||
        file.match(/app\/.*\/layout\.tsx$/)
    );

    clientSideFiles.forEach((file) => {
      const code = fs.readFileSync(file, 'utf8');
      expect(code).not.toMatch(/@prisma\/client/);
      expect(code).not.toMatch(/from ('|")@\/src\/lib\/db('|")/);
    });
  });

  it('files in /hooks folder must start with "use"', () => {
    const files = glob.sync('src/hooks/*.{ts,tsx}');
    files.forEach((file) => {
      const name = path.basename(file, path.extname(file));
      // Bỏ qua file index nếu có
      if (name === 'index') return;
      expect(name).toMatch(/^use[A-Z]|^use-[a-z]/);
    });
  });

  // Thêm các test kiến trúc khác ở đây
});