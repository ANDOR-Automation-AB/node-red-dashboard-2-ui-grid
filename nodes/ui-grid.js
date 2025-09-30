module.exports = function (RED) {
    function UIGridNode (config) {
        RED.nodes.createNode(this, config)

        const node = this
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        const toArray = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? [v] : v

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                const updates = msg.ui_update
                if (updates) {
                    if ('selectedRow'  in updates) base.stores.state.set(base, node, msg, 'selectedRow',  updates.selectedRow )
                    if ('selectedCell' in updates) base.stores.state.set(base, node, msg, 'selectedCell', updates.selectedCell)
                    if ('sortOrder'    in updates) base.stores.state.set(base, node, msg, 'sortOrder',    updates.sortOrder   )
                    if ('filters'      in updates) base.stores.state.set(base, node, msg, 'filters',      updates.filters     )
                    if ('editedValue'  in updates) base.stores.state.set(base, node, msg, 'editedValue',  updates.editedValue )
                }
                return msg;
            },
            onInput: function (msg, send, done) {
                const topic = msg.topic;
                const incoming = toArray(msg?.payload)
                const existing = base.stores.data.get(base, node)

                let data = Array.isArray(existing?.payload) ? existing.payload : []
                
                if (topic) {
                    switch (topic) {
                        case 'create': {
                            const add = Array.isArray(incoming) ? incoming : []
                            data = [...data, ...add]
                            affected = add.length
                            break
                        }
                        case 'read': {
                            msg.payload = data
                            affected = data.length
                            base.stores.data.save(base, node, { ...msg, payload: data })
                            send(msg); done && done()
                            return
                        }
                        case 'update': {
                            const obj = (incoming && !Array.isArray(incoming)) ? incoming : null
                            let updated = 0
                            if (obj && typeof obj.id !== 'undefined') {
                                data = data.map(row => {
                                    if (row.id === obj.id) { updated++; return { ...row, ...obj } }
                                    return row
                                })
                            }
                            affected = updated
                            break
                        }
                        case 'delete': {
                            const obj = (incoming && !Array.isArray(incoming)) ? incoming : null
                            const before = data.length
                            const id = obj?.id
                            data = typeof id === 'undefined' ? data : data.filter(r => r.id !== id)
                            affected = before - data.length
                            break
                        }
                        default: {
                            if (Array.isArray(incoming)) {
                                data = incoming
                                affected = data.length
                            }
                        }
                    }
                } else {
                    data = Array.isArray(incoming) ? incoming : []
                    affected = data.length
                }
                base.stores.data.save(base, node, { ...msg, payload: data })
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
