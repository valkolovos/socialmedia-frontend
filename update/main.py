import os
import re
import sys
import time

from datetime import datetime

import pexpect

def retry_command(cmd, timeout=None):
    retries = 0
    while retries < 5:
        print(f'Executing command "{cmd}"')
        script = pexpect.spawn(cmd, encoding='utf-8', timeout=timeout)
        script.logfile = sys.stdout
        script.expect(pexpect.EOF)
        script.close()
        if script.exitstatus == 0:
            return script.before
        time.sleep(3)
        retries += 1
    raise Exception(f'{cmd} exceeded retry count')

def main():
    try:
        project_re = re.compile(r'project = ([^\r]*)')
        project_result = retry_command('gcloud config list project')
        re_match = project_re.search(project_result)
        project_name = re_match.group(1)

        print('Cloning frontend...')
        retry_command('rm -rf socialmedia-frontend')
        retry_command('git clone https://github.com/valkolovos/socialmedia-frontend.git')
        print('Done cloning frontend')

        print('Installing frontend dependencies...')
        retry_command('./frontend_install_dependencies.sh')
        print('Done installing frontend dependencies')

        print('Building frontend...')
        app_host = retry_command('gcloud app browse --no-launch-browser')
        app_host = app_host.replace('\r','').replace('\n','')
        retry_command(f'./frontend_build.sh {project_name} {app_host}')
        print('Done building frontend...')

        bucket_ls_response = retry_command(f'gsutil ls -p {project_name}')
        if f'gs://frontend-{project_name}' not in bucket_ls_response:
            print('Creating frontend bucket...')
            retry_command(f'gsutil mb -p {project_name} -l us gs://frontend-{project_name}')
            retry_command(f'gsutil defacl ch -u AllUsers:R gs://frontend-{project_name}')
            print('Done creating frontend bucket')

        print('Deploying frontend...')
        retry_command(f'gsutil -m cp -r socialmedia-frontend/dist/* gs://frontend-{project_name}/')
        print('Done deploying frontend')

        secrets_list = retry_command('gcloud secrets list --format="value(name)"')

        print('Writing frontend SHA to GCP secrets...')
        frontend_sha_result = retry_command(
            'git ls-remote https://github.com/valkolovos/socialmedia-frontend.git main'
        )
        frontend_sha = frontend_sha_result.split('\t')[0]
        with open('frontend_sha.json', 'w') as shas:
            shas.write(f'{{"frontendSHA":"{frontend_sha}"}}')
        retry_command('gcloud secrets versions add frontend-sha --data-file=frontend_sha.json"')
        print('Done writing frontend SHA to GCP secrets')
    except Exception as e:
        raise e
    finally:
        print('all done')

if __name__ == "__main__":
    main()

