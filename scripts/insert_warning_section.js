const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/globals/SiteSettings.ts');
let content = fs.readFileSync(file, 'utf8');

// The section we want to insert after (the closing of the first tab)
// We find the pattern: comment line + \r\n + "          ]" + \r\n + "        },"
// followed by the second tab opening "        {\r\n          label: 'Thành phần"

const marker = "        // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n          ]\r\n        },\r\n        {\r\n          label: 'Th";

const insertBefore = "\r\n          ]\r\n        },\r\n        {\r\n          label: 'Th";
const warningGroupCode = `\r\n        {\r\n          type: 'group',\r\n          label: '🔥 Cảnh báo quan trọng (bên phải Banner)',\r\n          name: 'warningSection',\r\n          fields: [\r\n            {\r\n              type: 'row',\r\n              fields: [\r\n                {\r\n                  name: 'isEnabled',\r\n                  type: 'checkbox',\r\n                  label: 'Hiển thị khối Cảnh báo quan trọng',\r\n                  defaultValue: true,\r\n                  admin: {\r\n                    description: 'Bỏ chọn để ẩn hoàn toàn phần video cảnh báo bên phải banner trang chủ.',\r\n                  },\r\n                },\r\n                {\r\n                  name: 'icon',\r\n                  type: 'text',\r\n                  label: 'Biểu tượng (Emoji hoặc URL ảnh)',\r\n                  defaultValue: '🔥',\r\n                  admin: {\r\n                    description: 'Nhập emoji (VD: 🔥 ⚠️ 📢) hoặc URL ảnh (https://...).',\r\n                    condition: (data: any) => data?.warningSection?.isEnabled !== false,\r\n                  },\r\n                },\r\n              ],\r\n            },\r\n            {\r\n              name: 'title',\r\n              type: 'text',\r\n              label: 'Tiêu đề phần Cảnh báo',\r\n              defaultValue: 'Cảnh báo quan trọng',\r\n              admin: {\r\n                description: 'Tiêu đề hiển thị phía trên danh sách video cảnh báo.',\r\n                condition: (data: any) => data?.warningSection?.isEnabled !== false,\r\n              },\r\n            },\r\n          ],\r\n        },`;

// Check if already inserted
if (content.includes("name: 'warningSection'")) {
  console.log('warningSection already exists, skipping.');
  process.exit(0);
}

// Find insertBefore pattern after the comment line
const idx = content.indexOf(insertBefore);
if (idx === -1) {
  // Try CRLF variant
  const insertBefore2 = "\n          ]\n        },\n        {\n          label: 'Th";
  const idx2 = content.indexOf(insertBefore2);
  if (idx2 === -1) {
    console.error('Could not find insertion point. Searching for hints...');
    const hint = content.indexOf("label: 'Th\u00E0nh ph\u1EA7n d\u00F9ng chung'");
    console.log('Found label at:', hint);
    if (hint > 0) {
      console.log('Context:', JSON.stringify(content.substring(hint - 60, hint + 40)));
    }
    process.exit(1);
  }
  content = content.substring(0, idx2) + warningGroupCode.replace(/\r\n/g, '\n') + content.substring(idx2);
} else {
  content = content.substring(0, idx) + warningGroupCode + content.substring(idx);
}

fs.writeFileSync(file, content, 'utf8');
console.log('SUCCESS: warningSection inserted into SiteSettings.ts');
