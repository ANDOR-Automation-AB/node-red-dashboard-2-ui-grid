<template>
    <div class="ui-grid-wrapper">
        <table>
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col">{{ col }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in rows" :key="i">
                    <td v-for="col in columns" :key="col">{{ row[col] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        name: "UIGrid",
        inject: ['$dataTracker'],
        props: {
            id:    { type: String, required: true      },
            props: { type: Object, default: () => ({}) },
            state: { type: Object, default: () => ({}) }
        },
        data() { 
            return { 
                localData: [] 
            }
        },
        computed: {
            rows() {
                return this.localData
            },
            columns() {
                if (this.localData.length > 0) {
                    const set = new Set()
                    for (const r of this.localData) {
                        Object.keys(r).forEach(k => set.add(k))
                    }
                    return [...set]
                }
                return []
            }
        },
        created () {
            this.$dataTracker(this.id, this.onMsgInput, this.onLoad)
        },
        methods: {
            formatPayload (value) {
                if (value !== null && typeof value !== 'undefined') {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        return [value]
                    }
                }
                return value
            },
            onMsgInput (msg) {
                const value = this.formatPayload(msg?.payload)
                if (this.props.action === 'append') {
                    this.localData = value && value.length ? [...this.localData, ...value] : this.localData
                } else {
                    this.localData = value || []
                }
            },
            onLoad (history) {
                this.localData = []
                this.onMsgInput(history)
            }
        }
    }
</script>

<style scoped>
    @import "../stylesheets/ui-grid.css";
</style>