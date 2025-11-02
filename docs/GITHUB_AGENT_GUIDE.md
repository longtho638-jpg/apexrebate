# GitHub Copilot Agent: Codex Merge Fix

## 📋 Tổng quan (Overview)

Repository này đã được tích hợp **GitHub Copilot Agent** có tên `codex-merge-fix` để tự động hóa việc kiểm tra Pull Request.

This repository includes a **GitHub Copilot Agent** named `codex-merge-fix` to automate Pull Request validation.

## 🎯 Mục đích (Purpose)

Agent này giúp:
- Tự động kiểm tra PR khi có yêu cầu
- Chạy lint và build để đảm bảo code quality
- Đề xuất merge khi tất cả kiểm tra pass
- Hướng dẫn xử lý conflict và lỗi

This agent helps:
- Automatically validate PRs on demand
- Run lint and build to ensure code quality
- Suggest merge when all checks pass
- Guide conflict resolution and error handling

## 🚀 Cách sử dụng (How to Use)

### Bước 1: Kích hoạt GitHub Copilot Agents

Trước tiên, repository cần bật tính năng GitHub Copilot Agents:

1. Vào **Settings** của repository
2. Chọn **Copilot** → **Chat features**
3. Bật flag **"Enable Agents"**

First, enable GitHub Copilot Agents for your repository:

1. Go to repository **Settings**
2. Navigate to **Copilot** → **Chat features**
3. Enable the **"Enable Agents"** flag

### Bước 2: Trigger Agent trong Pull Request

Có 2 cách để kích hoạt agent:

There are 2 ways to trigger the agent:

#### Cách 1: Comment trong PR (PR Comment)

Trong phần comment của Pull Request, gõ:

In the PR comment section, type:

```
@codex-merge-fix run
```

hoặc (or)

```
@codex-merge-fix please check this PR
```

#### Cách 2: Sử dụng Copilot Chat

Trong GitHub Copilot Chat, gõ:

In GitHub Copilot Chat, type:

```
@codex-merge-fix please check this PR
```

### Bước 3: Agent sẽ tự động chạy

Agent sẽ:
1. Xác định PR hiện tại
2. Checkout code
3. Cài đặt dependencies (`npm ci --legacy-peer-deps`)
4. Chạy lint (`npm run lint`)
5. Chạy build (`npm run build`)
6. Báo cáo kết quả

The agent will:
1. Identify the current PR
2. Checkout the code
3. Install dependencies (`npm ci --legacy-peer-deps`)
4. Run lint (`npm run lint`)
5. Run build (`npm run build`)
6. Report results

## 📁 Cấu trúc file (File Structure)

```
.github/
├── agents/
│   └── codex-merge-fix.md          # Agent definition
└── workflows/
    └── agent-dispatch.yml          # Workflow to execute agent actions
```

### Agent Definition (`.github/agents/codex-merge-fix.md`)

File này chứa:
- Metadata của agent (name, description)
- Mô tả chức năng và cách hoạt động
- Hướng dẫn trigger

This file contains:
- Agent metadata (name, description)
- Function description and how it works
- Trigger instructions

### Workflow (`.github/workflows/agent-dispatch.yml`)

Workflow này:
- Lắng nghe `repository_dispatch` events
- Kiểm tra payload để xác định agent nào được gọi
- Chạy các lệnh lint và build
- Báo cáo lỗi nếu có

This workflow:
- Listens for `repository_dispatch` events
- Checks payload to identify which agent was called
- Runs lint and build commands
- Reports errors if any

## 🔧 Customization

### Thêm bước kiểm tra (Add more checks)

Để thêm bước kiểm tra, sửa file `.github/workflows/agent-dispatch.yml`:

To add more validation steps, edit `.github/workflows/agent-dispatch.yml`:

```yaml
- run: npm run test || echo "::error::Tests failed"
- run: npm run type-check || echo "::error::Type check failed"
```

### Tạo agent mới (Create new agents)

Để tạo agent mới:
1. Tạo file mới trong `.github/agents/` (ví dụ: `my-agent.md`)
2. Thêm metadata và mô tả
3. Thêm logic xử lý trong workflow

To create a new agent:
1. Create a new file in `.github/agents/` (e.g., `my-agent.md`)
2. Add metadata and description
3. Add processing logic in the workflow

## ⚠️ Lưu ý quan trọng (Important Notes)

1. **GitHub Copilot Subscription Required**: Cần subscription GitHub Copilot để sử dụng agent
2. **Agents Feature**: Tính năng "Agents" cần được bật trong settings
3. **Dependencies**: Project này yêu cầu `--legacy-peer-deps` khi cài đặt npm packages
4. **Workflow Permissions**: Đảm bảo workflow có quyền đọc/ghi repository

1. **GitHub Copilot Subscription Required**: GitHub Copilot subscription is needed to use agents
2. **Agents Feature**: The "Agents" feature must be enabled in settings
3. **Dependencies**: This project requires `--legacy-peer-deps` for npm package installation
4. **Workflow Permissions**: Ensure workflow has read/write permissions to the repository

## 🐛 Troubleshooting

### Agent không phản hồi (Agent not responding)

- Kiểm tra xem GitHub Copilot Agents đã được bật chưa
- Xác nhận bạn có subscription GitHub Copilot
- Đảm bảo file `.github/agents/codex-merge-fix.md` tồn tại

- Check if GitHub Copilot Agents is enabled
- Verify you have GitHub Copilot subscription
- Ensure `.github/agents/codex-merge-fix.md` exists

### Workflow không chạy (Workflow not running)

- Kiểm tra workflow file có syntax error không
- Xác nhận `repository_dispatch` event được gửi đúng
- Kiểm tra logs trong Actions tab

- Check workflow file for syntax errors
- Verify `repository_dispatch` event is sent correctly
- Check logs in the Actions tab

### Build/Lint thất bại (Build/Lint fails)

- Xem logs chi tiết trong GitHub Actions
- Chạy commands local để debug: `npm ci --legacy-peer-deps && npm run lint && npm run build`
- Kiểm tra dependencies có conflict không

- View detailed logs in GitHub Actions
- Run commands locally to debug: `npm ci --legacy-peer-deps && npm run lint && npm run build`
- Check for dependency conflicts

## 📚 Tài liệu tham khảo (References)

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository Dispatch Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)

## 🤝 Đóng góp (Contributing)

Nếu bạn muốn cải thiện agent hoặc thêm tính năng:
1. Fork repository
2. Tạo branch mới
3. Thực hiện thay đổi
4. Tạo Pull Request

If you want to improve the agent or add features:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Create a Pull Request
