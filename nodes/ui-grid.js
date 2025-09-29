module.exports = function (RED) {
    function UIGridNode (config) {
        RED.nodes.createNode(this, config)

        const node = this
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                const updates = msg.ui_update
                if (updates) {                    
                    if (updates.selectedRow !== undefined) {
                        base.stores.state.set(base, node, msg, 'selectedRow', updates.selectedRow)
                    }
                    if (updates.selectedCell !== undefined) {
                        base.stores.state.set(base, node, msg, 'selectedCell', updates.selectedCell)
                    }
                    if (updates.sortOrder !== undefined) {
                        base.stores.state.set(base, node, msg, 'sortOrder', updates.sortOrder)
                    }
                    if (updates.filters !== undefined) {
                        base.stores.state.set(base, node, msg, 'filters', updates.filters)
                    }
                    if (updates.editedValue !== undefined) {
                        base.stores.state.set(base, node, msg, 'editedValue', updates.editedValue)
                    }
                }
                return msg;
            },
            onInput: function (msg, send, done) {
                const topic = msg.topic;
                let data = base.stores.data.get(base, node) || [];
                msg.rowCount = data.length
                if (topic) {
                    if (topic === "create") {
                        msg.payload.forEach(obj => data.push(obj))
                        base.stores.data.save(base, node, data)
                        msg.affectedRows = msg.payload.length
                    }
                    if (topic === "read") {
                        msg.payload = data
                        msg.affectedRows = data.length
                    }
                    if (topic === "update") {
                        let updated = 0
                        data = data.map(row => {
                            if (row.id === msg.payload.id) {
                                updated++
                                return {...row, ...msg.payload}
                            }
                            return row
                        })
                        base.stores.data.save(base, node, data)
                        msg.affectedRows = updated
                    }
                    if (topic === "delete") {
                        const before = data.length
                        data = data.filter(row => row.id !== msg.payload.id)
                        const after = data.length
                        base.stores.data.save(base, node, data)
                        msg.affectedRows = before - after
                    }
                    else if (Array.isArray(msg.payload)) {
                        data = msg.payload;
                        base.stores.data.set(base, node, data);
                        msg.affectedRows = data.length;
                    }
                }
                send(msg)
                done && done()
            }
        }
        if (group) {
            group.register(node, config, evts)
        }
    }
    RED.nodes.registerType('ui-grid', UIGridNode)
}
