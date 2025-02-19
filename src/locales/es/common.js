import achievements from './common/achievements.json';
import portfolio from './common/portfolio.json';
import tools from './common/tools.json';
import contact from './common/contact.json';
import header from './common/header.json';
import skills from './common/skills.json';
import interactiveGraph from './common/interactiveGraph.json';
import navbar from './common/navbar.json';

const common = {
	...achievements,
	...portfolio,
	...tools,
	...contact,
	...header,
	...skills,
	...interactiveGraph,
	...navbar
};

export default common;
