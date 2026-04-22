const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'interviews.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadInterviews() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('加载面试记录失败:', error);
        return [];
    }
}

function saveInterviews(interviews) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(interviews, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('保存面试记录失败:', error);
        return false;
    }
}

app.post('/api/interview', (req, res) => {
    try {
        const { report, conversation, persona } = req.body;
        
        if (!report || !conversation) {
            return res.status(400).json({ success: false, error: '缺少必要数据' });
        }

        const interviews = loadInterviews();
        const newInterview = {
            id: Date.now(),
            date: new Date().toISOString(),
            persona: persona || 'devil',
            report: report,
            conversation: conversation,
            createdAt: new Date().toLocaleString('zh-CN')
        };

        interviews.unshift(newInterview);
        const success = saveInterviews(interviews);

        if (success) {
            res.json({ success: true, id: newInterview.id });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({ success: false, error: '服务器内部错误' });
    }
});

app.get('/api/interviews', (req, res) => {
    try {
        const interviews = loadInterviews();
        res.json({ success: true, interviews: interviews });
    } catch (error) {
        console.error('获取面试记录失败:', error);
        res.status(500).json({ success: false, error: '获取数据失败' });
    }
});

app.get('/api/interview/:id', (req, res) => {
    try {
        const interviews = loadInterviews();
        const interview = interviews.find(i => i.id === parseInt(req.params.id));
        
        if (interview) {
            res.json({ success: true, interview: interview });
        } else {
            res.status(404).json({ success: false, error: '面试记录不存在' });
        }
    } catch (error) {
        console.error('获取面试详情失败:', error);
        res.status(500).json({ success: false, error: '获取数据失败' });
    }
});

app.delete('/api/interview/:id', (req, res) => {
    try {
        let interviews = loadInterviews();
        const initialLength = interviews.length;
        interviews = interviews.filter(i => i.id !== parseInt(req.params.id));
        
        if (interviews.length < initialLength) {
            saveInterviews(interviews);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: '面试记录不存在' });
        }
    } catch (error) {
        console.error('删除面试记录失败:', error);
        res.status(500).json({ success: false, error: '删除失败' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('========================================');
    console.log('  STAR-DeepDive AI 后端服务器');
    console.log('  有鹅选鹅 · 智能面试新体验');
    console.log('========================================');
    console.log(`服务器运行在: http://localhost:${PORT}`);
    console.log(`管理页面: http://localhost:${PORT}`);
    console.log(`数据文件: ${DATA_FILE}`);
    console.log('========================================');
});
