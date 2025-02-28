const fs = require('fs');
const path = require('path');

class DashboardModifier {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
    }

    async modify(dashboardId, modifications) {
        const filePath = this.findDashboardFile(dashboardId);
        if (!filePath) {
            throw new Error(`Dashboard ${dashboardId} not found`);
        }

        try {
            const dashboard = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Apply modifications
            if (modifications.vars) {
                dashboard.model.vars = { ...dashboard.model.vars, ...modifications.vars };
            }
            if (modifications.opt) {
                dashboard.model.opt = { ...dashboard.model.opt, ...modifications.opt };
            }
            
            // Validate modifications
            this.validateDashboard(dashboard);
            
            // Save changes
            fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2));
            return dashboard;
        } catch (error) {
            throw new Error(`Failed to modify dashboard: ${error.message}`);
        }
    }

    findDashboardFile(dashboardId) {
        const files = fs.readdirSync(this.dataPath);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(this.dataPath, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (content.id === dashboardId || file === `${dashboardId}.json`) {
                    return filePath;
                }
            }
        }
        return null;
    }

    validateDashboard(dashboard) {
        if (!dashboard.model) {
            throw new Error('Invalid dashboard: missing model');
        }
        if (!dashboard.model.vars) {
            throw new Error('Invalid dashboard: missing variables');
        }
        if (!dashboard.model.opt) {
            throw new Error('Invalid dashboard: missing options');
        }
    }

    async readDashboard(dashboardId) {

        const filePath = this.findDashboardFile(dashboardId);
        if (!filePath) {
            throw new Error(`Dashboard ${dashboardId} not found`);
        }

        try {
            const dashboard = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.validateDashboard(dashboard);
            return dashboard;
        } catch (error) {
            throw new Error(`Failed to read dashboard: ${error.message}`);
        }
    }
}

module.exports = new DashboardModifier();