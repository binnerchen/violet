import React, {PropTypes} from 'react'
import AceEditor from 'react-ace'
import {
  DEFAULT_TITLE, AUTO_SAVING_STORE_PERIOD, AUTO_SAVING_DATABASE_PERIOD
} from '../helpers/const'
import * as utils from '../helpers/utils'
import * as DbUtils from '../helpers/database'
import _ from 'lodash'
import 'brace'
import 'brace/mode/markdown'
import 'brace/theme/crimson_editor'
import styles from './MarkdownArea.css'

export default React.createClass({
  propTypes: {
    actions: PropTypes.object.isRequired,
    states: PropTypes.object.isRequired
  },

  componentDidMount() {
    /**
     * 更新db不能频繁操作
     */
    this.syncStore = _.debounce(this.syncStore, AUTO_SAVING_STORE_PERIOD)
    this.syncDatabase = _.debounce(this.syncDatabase, AUTO_SAVING_DATABASE_PERIOD)
  },

  syncStore(value) {
    let post = this.props.states.posts.selected
    let title = utils.getMarkdownTitle(value)
    let now = Date.now()
    this.props.actions.postsUpdate({
      id: post.id,
      title,
      content: value,
      update_on: now
    })
    this.syncDatabase(post.id, value, now)
  },

  syncDatabase(id, value, now) {
    if (!id || !value) {
      return
    }

    let title = utils.getMarkdownTitle(value)
    let updates = {
      title: title || DEFAULT_TITLE,
      content: value,
      update_on: now
    }
    console.log('#Updating database:')
    console.log(updates)
    DbUtils.updatePost(id, updates).then(updated => {
      console.log('#Updating result:', updated)
    }).catch(err => {
      console.error(err.message)
    })
  },

  render() {
    let post = this.props.states.posts.selected
    let editorValue = post ? post.content : ''
    let options = {
      enableMultiselect: true,
      animatedScroll: true,
      enableEmmet: true,
      enableBasicAutocompletion: true,
      useElasticTabstops: true,
      fontSize: 16,
      wrap: true,
      displayIndentGuides: true,
      cursorStyle: 'slim'
    }

    return (
      <div ref="container" className={styles.markdownContainer}>
        <AceEditor
          ref="aceEditor"
          onChange={this.syncStore}
          className={styles.aceEditor}
          width="100%"
          height="100%"
          mode="markdown"
          theme="crimson_editor"
          value={editorValue}
          name="editor"
          showGutter={false}
          setOptions={options}
        />
      </div>
    )
  }
})
