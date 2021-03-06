export class DomainQuery {
    private domain: string
    private config: {
        fields: Array<any>,
        criteria?: any,
        sort?: any,
        limit?: any,
        offset?: any
    }

    constructor(domain) {
        this.domain = domain
        this.config = {
            fields: []
        }
    }

    /**
     * AQL query string.
     *
     * @returns {String}
     */
    get query(): string {
        let conf = this.config
        let _fields = conf.fields.length > 0 ? `.include(${conf.fields.map(v => JSON.stringify(v)).join(', ')})` : ''
        let _criteria = conf.criteria ? JSON.stringify(conf.criteria) : ''
        let _sort = conf.sort ? `.sort(${JSON.stringify(conf.sort)})` : ''
        let _limit = conf.limit ? `.limit(${JSON.stringify(conf.limit)})` : ''
        let _offset = conf.offset > 0 ? `.offset(${JSON.stringify(conf.offset)})` : ''

        return `${this.domain}.find(${_criteria})${_fields}${_sort}${_offset}${_limit}`
    }

    /**
     * Find domain query with criteria.
     *
     * @param criteria
     * @returns {DomainQuery}
     */
    find(criteria): this {
        if (criteria) {
            this.config.criteria = Object.assign({}, criteria)
        }

        return this
    }

    /**
     * Include fields.
     *
     *      domain.include("name", "repo")
     *
     * @returns {DomainQuery}
     */
    include(): this {
        let args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))
        let schema = ['string']

        if (this._isValid(args, schema)) {
            this.config.fields = this.config.fields.concat(args)
        } else {
            this._warn('Field configuration is not valid', args, schema)
        }

        return this
    }

    /**
     * Sort object
     * @param sort
     * @returns {DomainQuery}
     */
    sort(sort): this {

        let schema = {
            $asc: ['string'],
            $dsc: ['string']
        }

        if (this._isValid(sort, schema)) {
            this.config.sort = sort
        } else {
            this._warn('Sort configuration is not valid', sort, schema)
        }

        return this
    }

    /**
     * Limit
     * @param num
     * @returns {DomainQuery}
     */
    limit(num): this {
        let schema = 0

        if (this._isValid(num, schema)) {
            this.config.limit = num
        } else {
            this._warn('Limit configuration is not valid', num, schema)
        }

        return this
    }

    /**
     * Offset
     * @param num
     * @returns {DomainQuery}
     */
    offset(num): this {
        let schema = 0

        if (this._isValid(num, schema)) {
            this.config.offset = num
        } else {
            this._warn('Offset configuration is not valid', num, schema)
        }

        return this
    }

    /**
     * Validate input objects with a schema.
     *
     * @param obj
     * @param schema
     * @returns {boolean}
     * @private
     */
    private _isValid(obj, schema) {
        let typeofObj = Array.isArray(obj) ? 'array' : typeof obj
        let typeofSchema = Array.isArray(schema) ? 'array' : typeof schema

        if (typeofObj === typeofSchema) {
            if (['string', 'boolean', 'number'].indexOf(typeofObj) > -1) {
                return true
            } else if (typeofObj === 'array' && schema.length > 0 && obj.length > 0) {
                return obj.every(elem => this._isValid(elem, schema[0]))
            } else if (typeofObj === 'object') {
                return Object.keys(obj).every(key => {
                    let isInSchema = Object.keys(schema).indexOf(key) > -1
                    let isValid = this._isValid(obj[key], schema[key])

                    return isInSchema && isValid
                })
            }
        }

        return false
    }

    /**
     * Console output.
     *
     * @param message
     * @param obj
     * @param schema
     * @private
     */
    private _warn(message, obj, schema) {
        console.warn(`AQL: ${message}: ${JSON.stringify(obj)}`)
        console.warn(`     Provided object : ${JSON.stringify(obj)}`)
        console.warn(`     Schema object   : ${JSON.stringify(schema)}`)
    }
}

export namespace DomainQuery {
    export const items = () => new DomainQuery('items')
    export const builds = () => new DomainQuery('builds')
    export const archives = () => new DomainQuery('archive.entries')
}
