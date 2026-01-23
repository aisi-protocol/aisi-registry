# AISI Registry - 服务注册中心

AISI协议官方服务注册中心，为智能体提供标准化的原子服务目录。

## 功能特性
- 🔍 服务发现：通过 `aisi://` 协议发现服务
- 📝 服务注册：简单表单注册API服务
- 🗂️ 服务目录：分类浏览所有可用服务
- 🤖 智能体友好：结构化服务描述

## 快速开始

### 查询服务
```bash
GET https://registry.aisi.run/api/resolve/aisi://heweather/current-weather
