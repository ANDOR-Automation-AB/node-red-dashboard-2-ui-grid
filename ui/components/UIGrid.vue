<template>
    <div className="ui-grid-wrapper">
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
        props: {
            msg: { type: Object, required: true }
        },
        computed: {
            rows() {
                return Array.isArray(this.msg?.payload) ? this.msg.payload : []
            },
            columns() {
                if (this.rows.length > 0) {
                    return Object.keys(this.rows[0])
                }
                return []
            }
        }
    }
</script>

<style scoped>
    @import "../stylesheets/ui-grid.css";
</style>